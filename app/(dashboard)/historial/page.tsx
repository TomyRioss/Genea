"use client"

import { useEffect, useState } from "react"
import { History, ImageOff, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import ImageModal from "@/components/historial/ImageModal"

interface ImageData {
  id: string
  imageUrl: string
  thumbnailUrl: string | null
  width: number
  height: number
  model: string
  status: string
  createdAt: string
  isPublic: boolean
  isFavorite: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function HistorialPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)

  const fetchImages = async (page = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/historial?page=${page}&limit=20`)
      const data = await res.json()
      if (res.ok) {
        setImages(data.images)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM yyyy", { locale: es })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center gap-3">
        <History className="h-6 w-6 text-gray-700" />
        <h1 className="text-2xl font-semibold text-gray-900">Historial</h1>
        {pagination && (
          <span className="text-sm text-gray-500">
            {pagination.total} imágenes
          </span>
        )}
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ImageOff className="h-16 w-16 text-gray-300" />
          <p className="mt-4 text-lg text-gray-500">No tienes imágenes generadas</p>
          <p className="text-sm text-gray-400">
            Las imágenes que generes aparecerán aquí
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 transition-transform hover:scale-[1.02]"
              >
                <img
                  src={image.thumbnailUrl || image.imageUrl}
                  alt="Imagen generada"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-xs text-white">{formatDate(image.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => fetchImages(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-4 text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchImages(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  )
}
