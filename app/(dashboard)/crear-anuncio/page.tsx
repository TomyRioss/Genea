import ImageUpload from "@/components/dashboard/ImageUpload";

export default function CrearAnuncioPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Crear anuncio</h2>
        <p className="text-sm text-gray-500">Crea anuncios para tus productos</p>
      </div>
      <ImageUpload />
    </div>
  );
}
