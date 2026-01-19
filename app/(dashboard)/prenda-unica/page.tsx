"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ImageUpload from "@/components/dashboard/ImageUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { uploadImage } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, X, Download, Share2, MessageCircle } from "lucide-react";

const modelOptions = [
  { id: "rubia", labelFemale: "Rubia", labelMale: "Rubio", labelEn: "blonde", imageFile: "blonde.jpeg" },
  { id: "asiatica", labelFemale: "Asiática", labelMale: "Asiático", labelEn: "asian", imageFile: "asian.jpeg" },
  { id: "latina", labelFemale: "Latina", labelMale: "Latino", labelEn: "latina", imageFile: "latina.jpeg", imageFileMale: "latino.jpeg" },
  { id: "pelirroja", labelFemale: "Pelirroja", labelMale: "Pelirrojo", labelEn: "redhead", imageFile: "redhead.jpeg" },
  { id: "afroamericana", labelFemale: "Afroamericana", labelMale: "Afroamericano", labelEn: "african american", imageFile: "afroamerican.jpeg" },
];

const generationTips = [
  "Añadí descripciones para mejorar la calidad",
  "Utiliza fotos claras para detectar el tipo de ropa mejor",
  "Podés especificar el material de la ropa en la descripción",
];

const WHATSAPP_NUMBER = "5491134083140";

export default function PrendaUnicaPage() {
  const { data: session } = useSession();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("rubia");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [bodyType, setBodyType] = useState<string>("regular");
  const [imageCount, setImageCount] = useState<number>(1);
  const [generating, setGenerating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [showNoCreditsDialog, setShowNoCreditsDialog] = useState(false);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/user/credits");
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits || 0);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
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

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    const tipRotator = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % generationTips.length);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(tipRotator);
    };
  }, [generating]);

  const pollForResult = async (requestId: string, bucket: string, userId: string): Promise<string[] | null> => {
    while (true) {
      const response = await fetch(`/api/generate/${requestId}?bucket=${bucket}&userId=${userId}`);
      const result = await response.json();

      if (!response.ok) {
        console.error("Polling error:", result);
        return null;
      }

      const status = result.data?.status;

      if (status === "completed") {
        return result.data.outputs || [];
      } else if (status === "failed") {
        console.error("Generation failed:", result.data?.error);
        return null;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  };

  const generateSingleImage = async (
    imageUrl: string,
    modelType: string,
    userId: string
  ): Promise<string | null> => {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: [imageUrl],
        modelType,
        gender,
        bodyType,
        description,
      }),
    });

    const data = await response.json();
    const requestId = data.data?.id;

    if (!requestId) return null;

    const images = await pollForResult(requestId, "prenda-unica", userId);
    return images && images.length > 0 ? images[0] : null;
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      alert("Sube una imagen antes de generar");
      return;
    }

    const requiredCredits = imageCount * 10;
    if (credits < requiredCredits) {
      setShowNoCreditsDialog(true);
      return;
    }

    setGenerating(true);
    setGeneratedImages([]);
    const model = modelOptions.find((m) => m.id === selectedModel);
    const userId = session?.user?.id;

    if (!userId) {
      alert("Error de sesión");
      setGenerating(false);
      return;
    }

    try {
      // Subir imagen a Storage
      const uploadedUrl = await uploadImage("prenda-unica", "upload", userId, imageFile);
      if (!uploadedUrl) {
        alert("Error al subir imagen");
        setGenerating(false);
        return;
      }

      const modelType = model?.labelEn || "blonde";

      // Construir el prompt real
      const genderText = gender === "female" ? "woman" : gender;
      const bodyTypeMap: Record<string, string> = { petite: "short", curvy: "curvy" };
      const bodyTypeText = bodyType !== "regular" ? `${bodyTypeMap[bodyType] || bodyType} ` : "";
      const prompt = `Generate a ${bodyTypeText}${modelType} young ${genderText} model wearing this clothes ${description}, white background, full body shot`;

      const imagePromises = Array.from({ length: imageCount }, () =>
        generateSingleImage(uploadedUrl, modelType, userId)
      );

      const results = await Promise.all(imagePromises);
      const validImages = results.filter((img): img is string => img !== null);

      if (validImages.length > 0) {
        setGeneratedImages(validImages);

        const deductedAmount = validImages.length * 10;
        await fetch("/api/credits/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: deductedAmount }),
        });
        setCredits((prev) => Math.max(0, prev - deductedAmount));

        // Guardar imágenes en historial
        const saveResults = await Promise.all(
          validImages.map(async (imageUrl) => {
            const res = await fetch("/api/historial", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl, prompt, creditsUsed: 10 }),
            });
            if (!res.ok) {
              const err = await res.json();
              console.error("Error guardando imagen:", err);
            }
            return res.ok;
          })
        );
        console.log("Imágenes guardadas:", saveResults.filter(Boolean).length);
      } else {
        alert("Error al generar imágenes");
      }
    } catch (error) {
      console.error("Error generating:", error);
      alert("Error al generar imagen");
    } finally {
      setGenerating(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDownload = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `imagen-generada-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleShareWhatsApp = (url: string) => {
    const text = encodeURIComponent("Mirá esta imagen que generé!");
    const whatsappUrl = `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Prenda única</h2>
        <p className="text-sm text-gray-500">Sube una imagen de la prenda completa</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Imagen de la prenda</label>
        <ImageUpload onImageSelect={(file) => setImageFile(file)} />
        <Input
          placeholder="Descripción de la prenda... (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Género del modelo</label>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${gender === "female" ? "font-medium text-gray-900" : "text-gray-500"}`}>Mujer</span>
          <Switch
            checked={gender === "male"}
            onCheckedChange={(checked) => setGender(checked ? "male" : "female")}
          />
          <span className={`text-sm ${gender === "male" ? "font-medium text-gray-900" : "text-gray-500"}`}>Hombre</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Talle del modelo</label>
        <div className="flex gap-2">
          {["petite", "regular", "curvy"].map((type) => (
            <button
              key={type}
              onClick={() => setBodyType(type)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                bodyType === type
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Seleccionar modelo</label>
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          {modelOptions.map((model) => {
            const imageFile = gender === "male" && model.imageFileMale ? model.imageFileMale : model.imageFile;
            const imagePath = gender === "male" ? `/models/male/${imageFile}` : `/models/${model.imageFile}`;
            const label = gender === "male" ? model.labelMale : model.labelFemale;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`relative overflow-hidden rounded-xl transition-all flex-shrink-0 ${
                  selectedModel === model.id
                    ? "ring-2 ring-gray-900 ring-offset-2"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={imagePath}
                  alt={label}
                  className="h-36 w-28 md:h-44 md:w-36 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-2 text-sm font-medium text-white">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Cantidad de imágenes</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => setImageCount(num)}
              className={`h-10 w-10 rounded-lg border text-sm font-medium transition-all ${
                imageCount === num
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {generating ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              Generando {imageCount} {imageCount === 1 ? "imagen" : "imágenes"}... {elapsedTime}s
            </span>
          </div>
          <p className="text-center text-sm text-gray-500">
            Tip: {generationTips[currentTip]}
          </p>
        </div>
      ) : (
        <Button className="w-full" size="lg" onClick={handleGenerate}>
          Generar Imagen ({imageCount * 10} créditos)
        </Button>
      )}

      {generatedImages.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Imágenes generadas</label>
          <div className={`grid gap-4 ${generatedImages.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-2"}`}>
            {generatedImages.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Generada ${index + 1}`}
                onClick={() => setSelectedImage(url)}
                className="w-full cursor-pointer rounded-lg border border-gray-200 transition-transform hover:scale-[1.02]"
              />
            ))}
          </div>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Imagen completa"
              className="max-h-[80vh] rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -right-2 -top-2 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mt-4 flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleDownload(selectedImage)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShareWhatsApp(selectedImage)}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showNoCreditsDialog} onOpenChange={setShowNoCreditsDialog}>
        <DialogContent className="max-w-xs p-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <MessageCircle className="h-6 w-6 text-gray-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-center text-base">Créditos insuficientes</DialogTitle>
              <DialogDescription className="text-center text-sm">
                Recargá tus créditos para continuar.
              </DialogDescription>
            </div>
            <div className="flex w-full gap-2 pt-2">
              <Button
                onClick={() => setShowNoCreditsDialog(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, quiero recargar créditos")}`, "_blank");
                }}
                size="sm"
                className="flex-1 gap-1.5"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
