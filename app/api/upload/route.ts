import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type BucketName = "sin-modelo" | "prenda-unica" | "prendas-separadas" | "calzado" | "backgrounds";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as BucketName;
    const folder = formData.get("folder") as string | null;

    if (!file || !bucket) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const path = folder ? `${folder}/${fileName}` : `upload/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type || "image/jpeg" });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 });
  }
}
