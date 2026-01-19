import ImageUpload from "@/components/dashboard/ImageUpload";

export default function IluminacionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Iluminación</h2>
        <p className="text-sm text-gray-500">Ajusta la iluminación de tus fotos</p>
      </div>
      <ImageUpload />
    </div>
  );
}
