'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '@/components/dashboard/ImageUpload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { uploadImage } from '@/lib/storage';
import { X, Link, Plus, Ban } from 'lucide-react';
import {
  ImagePreviewModal,
  NoCreditsDialog,
  GeneratingState,
  GeneratedGallery,
} from '@/components/generation';
import {
  modelOptions,
  backgroundOptions,
  ageOptions,
  bodyTypeOptions,
  generationTips,
  bodyTypeMap,
  posesByBackground,
} from '@/lib/constants/generation';

export default function PrendasSeparadasPage() {
  const { data: session } = useSession();
  const [imageFiles, setImageFiles] = useState<{ top?: File; bottom?: File }>({});
  const [descriptions, setDescriptions] = useState({ top: '', bottom: '' });
  const [aiGenerated, setAiGenerated] = useState({ top: false, bottom: false });
  const [accessories, setAccessories] = useState<{ file?: File; description: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState('rubia');
  const [selectedBackground, setSelectedBackground] = useState('blanco');
  const [selectedPose, setSelectedPose] = useState('parada');
  const [customBackgroundDescription, setCustomBackgroundDescription] = useState('');
  const [customModelDescription, setCustomModelDescription] = useState('');
  const [customModelMode, setCustomModelMode] = useState<'prompt' | 'image'>('prompt');
  const [customBackgroundMode, setCustomBackgroundMode] = useState<'prompt' | 'image'>('prompt');
  const [customModelImage, setCustomModelImage] = useState<File | undefined>();
  const [customBackgroundImage, setCustomBackgroundImage] = useState<File | undefined>();
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [age, setAge] = useState<'kid' | 'young' | 'adult'>('young');
  const [bodyType, setBodyType] = useState('regular');
  const [imageCount, setImageCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const [showNoCreditsDialog, setShowNoCreditsDialog] = useState(false);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('/api/user/credits');
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits || 0);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };
    fetchCredits();
  }, []);

  useEffect(() => {
    if (!generating) {
      setElapsedTime(0);
      setCurrentTip(0);
      return;
    }
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    const tipRotator = setInterval(() => setCurrentTip(prev => (prev + 1) % generationTips.length), 4000);
    return () => {
      clearInterval(timer);
      clearInterval(tipRotator);
    };
  }, [generating]);

  useEffect(() => {
    const poses = posesByBackground[selectedBackground] || posesByBackground.blanco;
    setSelectedPose(poses[0].id);
  }, [selectedBackground]);

  const pollForResult = async (requestId: string, bucket: string, userId: string): Promise<string[] | null> => {
    while (true) {
      const response = await fetch(`/api/generate/${requestId}?bucket=${bucket}&userId=${userId}`);
      const result = await response.json();
      if (!response.ok) return null;
      const status = result.data?.status;
      if (status === 'completed') return result.data.outputs || [];
      if (status === 'failed') return null;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const generateSingleImage = async (
    topUrl: string | null,
    bottomUrl: string | null,
    modelType: string,
    userId: string,
    topDesc: string,
    bottomDesc: string,
    accessoryUrls: { url: string; description: string }[],
    customModelUrl: string | null,
    customBackgroundUrl: string | null,
  ): Promise<string | null> => {
    const imageUrls = [topUrl, bottomUrl].filter((url): url is string => url !== null);
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: imageUrls,
        modelType,
        gender,
        bodyType,
        age,
        background: selectedBackground,
        pose: selectedPose,
        customBackground: selectedBackground === 'custom' ? customBackgroundDescription : undefined,
        topDescription: topDesc,
        bottomDescription: bottomDesc,
        aiGeneratedTop: !topUrl,
        aiGeneratedBottom: !bottomUrl,
        accessories: accessoryUrls,
        customModelMode,
        customModelUrl,
        customBackgroundMode,
        customBackgroundUrl,
      }),
    });
    const data = await response.json();
    const requestId = data.data?.id;
    if (!requestId) return null;
    const images = await pollForResult(requestId, 'prendas-separadas', userId);
    return images && images.length > 0 ? images[0] : null;
  };

  const handleGenerate = async () => {
    if (!aiGenerated.top && !imageFiles.top) {
      alert("Sube la imagen de la parte superior o activa 'Generado por IA'");
      return;
    }
    if (!aiGenerated.bottom && !imageFiles.bottom) {
      alert("Sube la imagen de la parte inferior o activa 'Generado por IA'");
      return;
    }
    if (aiGenerated.top && aiGenerated.bottom) {
      alert('Al menos una prenda debe tener imagen');
      return;
    }
    if (selectedModel === 'custom') {
      if (customModelMode === 'prompt' && !customModelDescription.trim()) {
        alert('Describe cómo quieres que sea el modelo');
        return;
      }
      if (customModelMode === 'image' && !customModelImage) {
        alert('Sube una imagen del modelo');
        return;
      }
    }
    if (selectedBackground === 'custom') {
      if (customBackgroundMode === 'prompt' && !customBackgroundDescription.trim()) {
        alert('Describe el fondo personalizado');
        return;
      }
      if (customBackgroundMode === 'image' && !customBackgroundImage) {
        alert('Sube una imagen del fondo');
        return;
      }
    }
    if (credits < imageCount * 10) {
      setShowNoCreditsDialog(true);
      return;
    }

    setGenerating(true);
    setGeneratedImages([]);
    const model = modelOptions.find(m => m.id === selectedModel);
    const userId = session?.user?.id;

    if (!userId) {
      alert('Error de sesión');
      setGenerating(false);
      return;
    }

    try {
      const topUrl = aiGenerated.top ? null : await uploadImage('prendas-separadas', 'upload', userId, imageFiles.top!);
      const bottomUrl = aiGenerated.bottom ? null : await uploadImage('prendas-separadas', 'upload', userId, imageFiles.bottom!);

      if (!aiGenerated.top && !topUrl) { alert('Error al subir imagen superior'); setGenerating(false); return; }
      if (!aiGenerated.bottom && !bottomUrl) { alert('Error al subir imagen inferior'); setGenerating(false); return; }

      let customModelUrl: string | null = null;
      let customBackgroundUrl: string | null = null;

      if (selectedModel === 'custom' && customModelMode === 'image' && customModelImage) {
        customModelUrl = await uploadImage('backgrounds', 'custom-model', userId, customModelImage);
        if (!customModelUrl) { alert('Error al subir imagen del modelo'); setGenerating(false); return; }
      }
      if (selectedBackground === 'custom' && customBackgroundMode === 'image' && customBackgroundImage) {
        customBackgroundUrl = await uploadImage('backgrounds', 'custom-background', userId, customBackgroundImage);
        if (!customBackgroundUrl) { alert('Error al subir imagen del fondo'); setGenerating(false); return; }
      }

      const accessoryUrls: { url: string; description: string }[] = [];
      for (const acc of accessories.filter(a => a.file)) {
        const url = await uploadImage('prendas-separadas', 'accessories', userId, acc.file!);
        if (url) accessoryUrls.push({ url, description: acc.description });
      }

      const modelType = selectedModel === 'custom' ? customModelDescription : model?.labelEn || 'blonde';
      const topDescription = aiGenerated.top ? 'generate a new upper garment that complements the outfit' : descriptions.top || '';
      const bottomDescription = aiGenerated.bottom ? 'generate a new bottom garment that complements the outfit' : descriptions.bottom || '';

      const genderText = gender === 'female' ? 'woman' : gender;
      const bodyTypeText = bodyType !== 'regular' ? `${bodyTypeMap[bodyType] || bodyType} ` : '';
      const accessoriesText = accessories.map(acc => acc.description).filter(d => d.trim()).join(', ');
      const accessoriesPart = accessoriesText ? `, wearing these accessories: ${accessoriesText}` : '';
      const backgroundText = selectedBackground === 'custom'
        ? customBackgroundDescription
        : (backgroundOptions.find(bg => bg.id === selectedBackground)?.labelEn || 'white background');
      const poseText = (posesByBackground[selectedBackground] || posesByBackground.blanco).find(p => p.id === selectedPose)?.labelEn || 'standing';
      const prompt = `Generate a ${bodyTypeText}${modelType} ${age} ${genderText} model ${poseText}, wearing the upper garment ${topDescription}, the bottom garment ${bottomDescription}${accessoriesPart}, ${backgroundText}, full body shot.`;

      const imagePromises = Array.from({ length: imageCount }, () =>
        generateSingleImage(topUrl, bottomUrl, modelType, userId, topDescription, bottomDescription, accessoryUrls, customModelUrl, customBackgroundUrl),
      );

      const results = await Promise.all(imagePromises);
      const validImages = results.filter((img): img is string => img !== null);

      if (validImages.length > 0) {
        setGeneratedImages(validImages);
        const deductedAmount = validImages.length * 10;
        await fetch('/api/credits/deduct', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: deductedAmount }) });
        setCredits(prev => Math.max(0, prev - deductedAmount));
        await Promise.all(validImages.map(imageUrl => fetch('/api/historial', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl, prompt, creditsUsed: 10 }) })));
      } else {
        alert('Error al generar imágenes');
      }
    } catch (error) {
      console.error('Error generating:', error);
      alert('Error al generar imagen');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Prendas separadas</h2>
        <p className="text-sm text-gray-500">Sube imágenes de la parte superior e inferior</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {['top', 'bottom'].map(type => (
          <div key={type} className="min-w-[280px] flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {type === 'top' ? 'Parte superior' : 'Parte inferior'}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Generado por IA</span>
                <Switch
                  checked={aiGenerated[type as 'top' | 'bottom']}
                  onCheckedChange={checked => setAiGenerated(prev => ({ ...prev, [type]: checked }))}
                />
              </div>
            </div>
            <ImageUpload
              onImageSelect={file => setImageFiles(prev => ({ ...prev, [type]: file }))}
              disabled={aiGenerated[type as 'top' | 'bottom']}
            />
            <Input
              placeholder="Descripción de la prenda... (opcional)"
              value={descriptions[type as 'top' | 'bottom']}
              onChange={e => setDescriptions(prev => ({ ...prev, [type]: e.target.value }))}
            />
          </div>
        ))}

        {accessories.map((accessory, index) => (
          <div key={index} className="min-w-[280px] flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Accesorio {index + 1}</label>
              <button onClick={() => setAccessories(prev => prev.filter((_, i) => i !== index))} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ImageUpload onImageSelect={file => setAccessories(prev => prev.map((acc, i) => (i === index ? { ...acc, file } : acc)))} />
            <Input
              placeholder="Descripción del accesorio... (opcional)"
              value={accessory.description}
              onChange={e => setAccessories(prev => prev.map((acc, i) => (i === index ? { ...acc, description: e.target.value } : acc)))}
            />
          </div>
        ))}

        <div className="flex items-start pt-6">
          <button onClick={() => setAccessories(prev => [...prev, { description: '' }])} className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-gray-300 p-3 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700">
            <Link className="h-5 w-5" />
            <span className="text-xs">Accesorio</span>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Edad del modelo</label>
          <div className="flex gap-2 md:gap-3">
            {ageOptions.map(option => (
              <button key={option.value} onClick={() => setAge(option.value as 'kid' | 'young' | 'adult')} className={`relative overflow-hidden rounded-xl transition-all flex-shrink-0 ${age === option.value ? 'outline outline-2 outline-offset-2 outline-gray-900' : 'opacity-70 hover:opacity-100'}`}>
                <img src={option.image} alt={option.label} className="h-32 w-24 md:h-40 md:w-32 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-2 text-sm font-medium text-white">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:block w-px bg-gray-200 self-stretch" />

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Talle del modelo</label>
          <div className="flex gap-2 md:gap-3">
            {bodyTypeOptions.map(option => (
              <button key={option.value} onClick={() => setBodyType(option.value)} className={`relative overflow-hidden rounded-xl transition-all flex-shrink-0 ${bodyType === option.value ? 'outline outline-2 outline-offset-2 outline-gray-900' : 'opacity-70 hover:opacity-100'}`}>
                <img src={option.image} alt={option.label} className="h-32 w-24 md:h-40 md:w-32 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-2 text-sm font-medium text-white">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Seleccionar modelo</label>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${gender === 'female' ? 'font-medium text-gray-900' : 'text-gray-500'}`}>Mujer</span>
          <Switch checked={gender === 'male'} onCheckedChange={checked => setGender(checked ? 'male' : 'female')} />
          <span className={`text-sm ${gender === 'male' ? 'font-medium text-gray-900' : 'text-gray-500'}`}>Hombre</span>
        </div>
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
          {modelOptions.map(model => {
            const imageFile = gender === 'male' && model.imageFileMale ? model.imageFileMale : model.imageFile;
            const imagePath = gender === 'male' ? `/models/male/${imageFile}` : `/models/${model.imageFile}`;
            const label = gender === 'male' ? model.labelMale : model.labelFemale;
            return (
              <button key={model.id} onClick={() => setSelectedModel(model.id)} className={`relative overflow-hidden rounded-xl transition-all flex-shrink-0 ${selectedModel === model.id ? 'outline outline-2 outline-offset-2 outline-gray-900' : 'opacity-70 hover:opacity-100'}`}>
                <img src={imagePath} alt={label} className="h-32 w-24 md:h-40 md:w-32 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-2 text-sm font-medium text-white">{label}</span>
              </button>
            );
          })}
          <button onClick={() => setSelectedModel('custom')} className={`relative flex h-32 w-24 md:h-40 md:w-32 flex-shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${selectedModel === 'custom' ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-400'}`}>
            <Plus className="h-8 w-8 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Personalizado</span>
          </button>
        </div>
        {selectedModel === 'custom' && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setCustomModelMode('prompt')}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${customModelMode === 'prompt' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Describir
              </button>
              <button
                onClick={() => setCustomModelMode('image')}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${customModelMode === 'image' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Subir imagen
              </button>
            </div>
            {customModelMode === 'prompt' ? (
              <Input placeholder="Describe el modelo (ej: morena con pelo largo)" value={customModelDescription} onChange={e => setCustomModelDescription(e.target.value)} />
            ) : (
              <ImageUpload onImageSelect={file => setCustomModelImage(file)} />
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Fondo</label>
        <div className="grid grid-rows-2 grid-flow-col gap-x-2 gap-y-2 overflow-x-auto p-3">
          <button onClick={() => setSelectedBackground('blanco')} className={`relative h-60 w-44 md:h-80 md:w-60 overflow-hidden rounded-xl transition-all ${selectedBackground === 'blanco' ? 'outline outline-2 outline-offset-2 outline-gray-900' : 'hover:opacity-90'}`}>
            <div className="h-full w-full bg-gray-100 flex flex-col items-center justify-center gap-1">
              <Ban className="h-12 w-12 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Sin Fondo</span>
              <span className="text-xs text-gray-400">Fondo Blanco</span>
            </div>
          </button>
          <button onClick={() => setSelectedBackground('custom')} className={`relative h-60 w-44 md:h-80 md:w-60 overflow-hidden rounded-xl transition-all ${selectedBackground === 'custom' ? 'outline outline-2 outline-offset-2 outline-gray-900' : 'hover:opacity-90'}`}>
            <div className="h-full w-full bg-gray-100 flex flex-col items-center justify-center gap-1">
              <Plus className="h-12 w-12 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Personalizado</span>
            </div>
          </button>
          {backgroundOptions.filter(bg => bg.id !== 'blanco').map(bg => (
            <button key={bg.id} onClick={() => setSelectedBackground(bg.id)} className={`relative h-60 w-44 md:h-80 md:w-60 overflow-hidden rounded-xl transition-all ${selectedBackground === bg.id ? 'outline outline-2 outline-offset-2 outline-gray-900' : 'hover:opacity-90'}`}>
              <img src={bg.image} alt={bg.label} className="h-full w-full object-cover scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-2 text-sm font-medium text-white">{bg.label}</span>
            </button>
          ))}
        </div>
        {selectedBackground === 'custom' && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setCustomBackgroundMode('prompt')}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${customBackgroundMode === 'prompt' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Describir
              </button>
              <button
                onClick={() => setCustomBackgroundMode('image')}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${customBackgroundMode === 'image' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Subir imagen
              </button>
            </div>
            {customBackgroundMode === 'prompt' ? (
              <Input
                placeholder="Describe el fondo (ej: en un parque al atardecer)"
                value={customBackgroundDescription}
                onChange={(e) => setCustomBackgroundDescription(e.target.value)}
              />
            ) : (
              <ImageUpload onImageSelect={file => setCustomBackgroundImage(file)} />
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Pose</label>
        <div className="flex gap-2 overflow-x-auto p-3">
          {(posesByBackground[selectedBackground] || posesByBackground.blanco).map(pose => (
            <button
              key={pose.id}
              onClick={() => setSelectedPose(pose.id)}
              className={`relative h-60 w-44 md:h-80 md:w-60 flex-shrink-0 overflow-hidden rounded-xl transition-all ${
                selectedPose === pose.id
                  ? 'outline outline-2 outline-offset-2 outline-gray-900'
                  : 'hover:opacity-90'
              }`}
            >
              <img src={pose.image} alt={pose.label} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-2 text-sm font-medium text-white">{pose.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Cantidad de imágenes</label>
        <div className="flex w-full gap-2">
          {[1, 2, 3, 4].map(num => (
            <button key={num} onClick={() => setImageCount(num)} className={`h-10 flex-1 rounded-lg border text-sm font-medium transition-all ${imageCount === num ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}>
              {num}
            </button>
          ))}
        </div>
      </div>

      {generating ? (
        <GeneratingState imageCount={imageCount} elapsedTime={elapsedTime} currentTip={currentTip} />
      ) : (
        <Button className="w-full" size="lg" onClick={handleGenerate}>
          Generar Imagen ({imageCount * 10} créditos)
        </Button>
      )}

      <GeneratedGallery images={generatedImages} onImageClick={setSelectedImage} />
      <ImagePreviewModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      <NoCreditsDialog open={showNoCreditsDialog} onOpenChange={setShowNoCreditsDialog} />
    </div>
  );
}
