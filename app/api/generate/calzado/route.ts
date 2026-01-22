import { NextRequest, NextResponse } from 'next/server';

const getRandomPose = () => {
  const poses = [
    'crossed legs sitting pose',
    'mid-stride walking pose',
    'legs up playful pose',
    'dynamic stepping pose',
  ];
  return poses[Math.floor(Math.random() * poses.length)];
};

export async function POST(req: NextRequest) {
  try {
    const { images, description, gender } = await req.json();

    const prompt = `${gender} legs from knee down wearing this shoes ${description || ''}, editorial footwear photography, ${getRandomPose()}, soft diffused lighting, beige seamless background, fashion campaign style`;

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
      return NextResponse.json(
        { error: 'Error al procesar solicitud' },
        { status: response.status },
      );
    }

    return NextResponse.json({ data: { id: data.data?.id } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al generar imagen' },
      { status: 500 },
    );
  }
}
