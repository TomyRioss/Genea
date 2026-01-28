import { NextRequest, NextResponse } from 'next/server';
import { poseToSupabaseFile } from '@/lib/constants/generation';

const SUPABASE_BUCKET_URL = 'https://hnvazssrikitqtpmvqzj.supabase.co/storage/v1/object/public/backgrounds';

export async function POST(req: NextRequest) {
  try {
    const {
      images,
      modelType,
      gender,
      bodyType,
      age,
      background,
      pose,
      customBackground,
      description,
      topDescription,
      bottomDescription,
      accessories,
      customModelMode,
      customModelUrl,
      customBackgroundMode,
      customBackgroundUrl,
      size,
    } = await req.json();

    const genderText = gender === 'female' ? 'woman' : gender || 'woman';
    const bodyTypeMap: Record<string, string> = { petite: 'short', curvy: 'curvy' };
    const bodyTypeText =
      bodyType && bodyType !== 'regular' ? `${bodyTypeMap[bodyType] || bodyType} ` : '';
    const ageText = age || 'young';

    // Construir texto de accesorios con referencias a figuras
    const accessoryUrls = accessories?.map((a: { url: string }) => a.url) || [];
    const accessoriesDescriptions = accessories
      ?.map((a: { description: string }, index: number) => {
        const figureNum = 4 + index; // Accesorios empiezan en figura 4
        return a.description?.trim() ? `${a.description} in figure ${figureNum}` : '';
      })
      .filter((d: string) => d)
      .join(', ');
    const accessoriesText = accessoriesDescriptions ? `, wearing ${accessoriesDescriptions}` : '';

    let prompt: string;
    let allImages: string[];

    // Determinar si usamos imagen de fondo (todos excepto custom)
    const useBackgroundImage = background && background !== 'custom';

    if (description) {
      // Prenda única
      const hasCustomModelImage = customModelMode === 'image' && customModelUrl;
      const hasCustomBackgroundImage = customBackgroundMode === 'image' && customBackgroundUrl;

      let figureOffset = 1;
      const imageOrder: string[] = [];

      // Background primero (si tiene imagen - preset o custom imagen)
      if (useBackgroundImage) {
        const bgFolder = background === 'blanco' ? 'estudio' : background;
        const poseFile = poseToSupabaseFile[bgFolder]?.[pose] || poseToSupabaseFile.estudio.parada;
        const backgroundUrl = `${SUPABASE_BUCKET_URL}/${bgFolder}/${poseFile}`;
        imageOrder.push(backgroundUrl);
        figureOffset++;
      } else if (hasCustomBackgroundImage) {
        imageOrder.push(customBackgroundUrl);
        figureOffset++;
      }

      // Modelo custom con imagen
      let modelFigure: number | null = null;
      if (hasCustomModelImage) {
        modelFigure = figureOffset;
        imageOrder.push(customModelUrl);
        figureOffset++;
      }

      // Prenda única
      const garmentFigure = figureOffset;
      imageOrder.push(...images);

      allImages = imageOrder;

      // Construir prompt según caso
      if (hasCustomModelImage && (useBackgroundImage || hasCustomBackgroundImage)) {
        prompt = `make the model in figure ${modelFigure} ${bodyTypeText}${ageText} ${genderText} wearing the garment ${description} in figure ${garmentFigure}, transfer style of figure 1 to the new model.`;
      } else if (hasCustomModelImage && !useBackgroundImage && !hasCustomBackgroundImage) {
        prompt = `make the model in figure ${modelFigure} ${bodyTypeText}${ageText} ${genderText} wearing the garment ${description} in figure ${garmentFigure}, ${customBackground || 'white'} background.`;
      } else if (useBackgroundImage || hasCustomBackgroundImage) {
        prompt = `generate a ${bodyTypeText}${modelType} ${ageText} ${genderText} model wearing the garment ${description} in figure ${garmentFigure}, transfer style of figure 1 to the new model.`;
      } else {
        prompt = `generate a ${bodyTypeText}${modelType} ${ageText} ${genderText} model wearing the garment ${description} in figure ${garmentFigure}, ${customBackground || 'white'} background.`;
      }
    } else {
      // Prendas separadas (superior e inferior)
      const hasCustomModelImage = customModelMode === 'image' && customModelUrl;
      const hasCustomBackgroundImage = customBackgroundMode === 'image' && customBackgroundUrl;

      // Calcular orden de imágenes y figuras dinámicamente
      let figureOffset = 1;
      const imageOrder: string[] = [];

      // Background primero (si tiene imagen - preset o custom imagen)
      if (useBackgroundImage) {
        const bgFolder = background === 'blanco' ? 'estudio' : background;
        const poseFile = poseToSupabaseFile[bgFolder]?.[pose] || poseToSupabaseFile.estudio.parada;
        const backgroundUrl = `${SUPABASE_BUCKET_URL}/${bgFolder}/${poseFile}`;
        imageOrder.push(backgroundUrl);
        figureOffset++;
      } else if (hasCustomBackgroundImage) {
        imageOrder.push(customBackgroundUrl);
        figureOffset++;
      }

      // Modelo custom con imagen
      let modelFigure: number | null = null;
      if (hasCustomModelImage) {
        modelFigure = figureOffset;
        imageOrder.push(customModelUrl);
        figureOffset++;
      }

      // Prendas
      const topFigure = figureOffset;
      const bottomFigure = figureOffset + 1;
      imageOrder.push(...images);
      figureOffset += images.length;

      // Accesorios - recalcular texto con figuras correctas
      const accessoriesTextDynamic = accessories
        ?.map((a: { description: string; url: string }, index: number) => {
          const accFigure = figureOffset + index;
          return a.description?.trim() ? `${a.description} in figure ${accFigure}` : '';
        })
        .filter((d: string) => d)
        .join(', ');
      const accessoriesPartDynamic = accessoriesTextDynamic ? `, wearing ${accessoriesTextDynamic}` : '';

      imageOrder.push(...accessoryUrls);
      allImages = imageOrder;

      // Construir prompt según caso
      if (hasCustomModelImage && (useBackgroundImage || hasCustomBackgroundImage)) {
        // Caso 1 y 3a: Modelo custom imagen + fondo con imagen (preset o custom)
        prompt = `make the model in figure ${modelFigure} ${bodyTypeText}${ageText} ${genderText} wearing the upper garment ${topDescription || ''} in figure ${topFigure}, the bottom garment ${bottomDescription || ''} in figure ${bottomFigure}${accessoriesPartDynamic}, transfer style of figure 1 to the new model.`;
      } else if (hasCustomModelImage && !useBackgroundImage && !hasCustomBackgroundImage) {
        // Caso 3b: Modelo custom imagen + fondo custom prompt
        prompt = `make the model in figure ${modelFigure} ${bodyTypeText}${ageText} ${genderText} wearing the upper garment ${topDescription || ''} in figure ${topFigure}, the bottom garment ${bottomDescription || ''} in figure ${bottomFigure}${accessoriesPartDynamic}, ${customBackground || 'white'} background.`;
      } else if (useBackgroundImage || hasCustomBackgroundImage) {
        // Caso 2: Fondo con imagen + modelo preset o custom prompt
        prompt = `generate a ${bodyTypeText}${modelType} ${ageText} ${genderText} model wearing the upper garment ${topDescription || ''} in figure ${topFigure}, the bottom garment ${bottomDescription || ''} in figure ${bottomFigure}${accessoriesPartDynamic}, transfer style of figure 1 to the new model.`;
      } else {
        // Caso 4: Ambos custom con prompt (sin imágenes custom)
        prompt = `generate a ${bodyTypeText}${modelType} ${ageText} ${genderText} model wearing the upper garment ${topDescription || ''} in figure ${topFigure}, the bottom garment ${bottomDescription || ''} in figure ${bottomFigure}${accessoriesPartDynamic}, ${customBackground || 'white'} background.`;
      }
    }

    const response = await fetch(
      'https://api.wavespeed.ai/api/v3/bytedance/seedream-v4/edit',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
        },
        body: JSON.stringify({
          enable_base64_output: false,
          enable_sync_mode: false,
          images: allImages,
          prompt,
          ...(size && { size }),
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Error al procesar solicitud' }, { status: response.status });
    }

    return NextResponse.json({ data: { id: data.data?.id } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al generar imagen' },
      { status: 500 },
    );
  }
}
