import ImageUpload from "@/components/dashboard/ImageUpload";

export default function EdicionLibrePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Edición libre</h2>
        <p className="text-sm text-gray-500">Edita tus imágenes libremente</p>
      </div>
      <ImageUpload />
    </div>
  );
}
