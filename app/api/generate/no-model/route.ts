import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { images, description, size } = await req.json();

    const prompt = `Make this garment${description ? ` ${description}` : ''} floating without model in a beige background`;

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
