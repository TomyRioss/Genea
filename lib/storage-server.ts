import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type BucketName = "sin-modelo" | "prenda-unica" | "prendas-separadas";

async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const watermarkPath = path.join(process.cwd(), "public", "GENEA.png");
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  const imgWidth = metadata.width || 1024;
  const imgHeight = metadata.height || 1024;

  const watermarkSize = Math.round(imgWidth * 0.15);
  const margin = Math.round(imgWidth * 0.02);

  const watermark = await sharp(watermarkPath)
    .resize(watermarkSize, watermarkSize, { fit: "inside" })
    .ensureAlpha()
    .png()
    .toBuffer();

  const watermarkMeta = await sharp(watermark).metadata();

  return image
    .composite([{
      input: watermark,
      top: imgHeight - (watermarkMeta.height || watermarkSize) - margin,
      left: imgWidth - (watermarkMeta.width || watermarkSize) - margin,
    }])
    .jpeg()
    .toBuffer();
}

export async function downloadAndUploadImage(
  bucket: BucketName,
  folder: "upload" | "generated",
  userId: string,
  imageUrl: string,
  userRole?: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer);

    if (userRole === "USER") {
      buffer = await applyWatermark(buffer);
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const filePath = `${folder}/${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, { contentType: "image/jpeg" });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error("Download and upload error:", error);
    return null;
  }
}
