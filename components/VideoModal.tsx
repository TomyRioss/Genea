"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { FiVideo } from "react-icons/fi";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white transition-colors hover:text-gray-300"
        >
          <X className="h-8 w-8" />
        </button>

        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-center">
            <FiVideo className="mx-auto mb-4 h-16 w-16 text-gray-500" />
            <h2 className="text-3xl font-bold text-white">Próximamente demo</h2>
            <p className="mt-2 text-gray-400">Estamos preparando algo increíble</p>
          </div>
        </div>
      </div>
    </div>
  );
}
