"use client"

import { X, Download, Share2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ImageData {
  id: string
  prompt: string
  imageUrl: string
  width: number
  height: number
  model: string
  createdAt: string
}

interface ImageModalProps {
  image: ImageData | null
  onClose: () => void
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  if (!image) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(image.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `genea-${image.id}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading:", error)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: "Imagen generada con GENEA",
      text: image.prompt,
      url: image.imageUrl,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error)
        }
      }
    } else {
      await navigator.clipboard.writeText(image.imageUrl)
      alert("URL copiada al portapapeles")
    }
  }

  const formattedDate = format(new Date(image.createdAt), "d 'de' MMMM, yyyy - HH:mm", {
    locale: es,
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Download className="h-4 w-4" />
              Descargar
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Share2 className="h-4 w-4" />
              Compartir
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <img
            src={image.imageUrl}
            alt={image.prompt}
            className="mx-auto max-h-[60vh] rounded-lg object-contain"
          />
        </div>

        <div className="border-t border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">Prompt:</span> {image.prompt}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {image.width} × {image.height}px
          </p>
        </div>
      </div>
    </div>
  )
}
