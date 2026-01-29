import { NextRequest, NextResponse } from "next/server";
import { downloadAndUploadImage } from "@/lib/storage-server";
import { auth } from "@/lib/auth";

type BucketName = "sin-modelo" | "prenda-unica" | "prendas-separadas";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get("bucket") as BucketName | null;
    const userId = searchParams.get("userId");

    const session = await auth();
    const userRole = session?.user?.role;

    const response = await fetch(
      `https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Error al obtener resultado' }, { status: response.status });
    }

    let outputs = data.data?.outputs || [];

    // Si está completado y tenemos bucket/userId, guardar en Storage
    if (data.data?.status === "completed" && bucket && userId && outputs.length > 0) {
      const uploadedUrls = await Promise.all(
        outputs.map((url: string) => downloadAndUploadImage(bucket, "generated", userId, url, userRole))
      );
      outputs = uploadedUrls.filter((url): url is string => url !== null);
    }

    return NextResponse.json({
      data: {
        status: data.data?.status,
        outputs,
        error: data.data?.error,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener resultado" }, { status: 500 });
  }
}
