'use client';

import { X, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({
  imageUrl,
  onClose,
}: ImagePreviewModalProps) {
  if (!imageUrl) return null;

  const handleDownload = async () => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `imagen-generada-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent('Mirá esta imagen que generé!');
    const whatsappUrl = `https://wa.me/?text=${text}%20${encodeURIComponent(imageUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Imagen completa"
          className="max-h-[80vh] rounded-lg"
        />
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mt-4 flex justify-center gap-3">
          <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Descargar
          </Button>
          <Button
            variant="outline"
            onClick={handleShareWhatsApp}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
