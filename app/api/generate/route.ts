import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { images, modelType, gender, bodyType, description, topDescription, bottomDescription } =
      await req.json();

    const genderText = gender === 'female' ? 'woman' : gender || 'woman';
    const bodyTypeMap: Record<string, string> = { petite: 'short', curvy: 'curvy' };
    const bodyTypeText =
      bodyType && bodyType !== 'regular' ? `${bodyTypeMap[bodyType] || bodyType} ` : '';

    const prompt = description
      ? `Generate a ${bodyTypeText}${modelType} young ${genderText} model wearing this clothes ${description}, white background, full body shot`
      : `Generate a ${bodyTypeText}${modelType} young ${genderText} model wearing the upper garment ${topDescription || ''} and the bottom garment ${bottomDescription || ''}, white background, full body shot`;

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
          images,
          prompt,
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
