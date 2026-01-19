import ImageUpload from "@/components/dashboard/ImageUpload";

export default function MejorarProductoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Mejorar producto</h2>
        <p className="text-sm text-gray-500">Mejora la calidad de tus fotos de producto</p>
      </div>
      <ImageUpload />
    </div>
  );
}
