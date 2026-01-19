type BucketName = "sin-modelo" | "prenda-unica" | "prendas-separadas";

export async function uploadImage(
  bucket: BucketName,
  _folder: "upload" | "generated",
  _userId: string,
  file: File | Blob
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Upload error:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}
