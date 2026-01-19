import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type BucketName = "sin-modelo" | "prenda-unica" | "prendas-separadas";

export async function downloadAndUploadImage(
  bucket: BucketName,
  folder: "upload" | "generated",
  userId: string,
  imageUrl: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const path = `${folder}/${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: "image/jpeg" });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error("Download and upload error:", error);
    return null;
  }
}
