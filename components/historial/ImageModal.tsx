"use client"

import { useEffect } from "react"
import { X, Download, Share2, Calendar, Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ImageData {
  id: string
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
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [onClose])

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
      title: "Imagen generada con Genea",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <ImageIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Imagen generada</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-900 p-6">
          <img
            src={image.imageUrl}
            alt="Imagen generada"
            className="mx-auto max-h-[55vh] rounded-lg object-contain shadow-lg"
          />
        </div>

        <div className="flex items-center justify-between bg-gray-50 px-6 py-4">
          <p className="text-sm text-gray-500">
            {image.width} × {image.height}px
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4" />
              Compartir
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              Descargar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
