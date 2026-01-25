'use client';

interface GeneratedGalleryProps {
  images: string[];
  onImageClick: (url: string) => void;
}

export default function GeneratedGallery({
  images,
  onImageClick,
}: GeneratedGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Imágenes generadas
      </label>
      <div
        className={`grid gap-4 ${images.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-2'}`}
      >
        {images.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Generada ${index + 1}`}
            onClick={() => onImageClick(url)}
            className="w-full cursor-pointer rounded-lg border border-gray-200 transition-transform hover:scale-[1.02]"
          />
        ))}
      </div>
    </div>
  );
}
