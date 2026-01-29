"use client";

import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  onImageSelect?: (file: File) => void;
  disabled?: boolean;
}

export default function ImageUpload({ onImageSelect, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      onImageSelect?.(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => setPreview(null);

  if (disabled) {
    return (
      <div className="relative flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
        <span className="text-sm text-gray-400">La IA generará esta prenda</span>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
        isDragging
          ? "border-gray-900 bg-gray-100"
          : "border-gray-300 bg-white hover:border-gray-400"
      }`}
    >
      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            className="max-h-[400px] rounded object-contain"
          />
          <button
            onClick={clearImage}
            className="absolute right-2 top-2 rounded-full bg-gray-900 p-1 text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-2 p-8">
          <Upload className="h-10 w-10 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Arrastra una imagen o haz clic para seleccionar
          </span>
          <span className="text-xs text-gray-500">PNG, JPG hasta 10MB</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      )}
    </div>
  );
}
