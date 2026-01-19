import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { imageUrl, prompt, creditsUsed } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "URL de imagen requerida" }, { status: 400 })
    }

    const image = await prisma.image.create({
      data: {
        userId: session.user.id,
        imageUrl,
        prompt: prompt || "generated",
        width: 1024,
        height: 1024,
        model: "seedream-v4",
        status: "COMPLETED",
        creditsUsed: creditsUsed || 10,
      },
    })

    return NextResponse.json({ success: true, id: image.id })
  } catch (error) {
    console.error("Error saving image:", error)
    return NextResponse.json({ error: "Error al guardar imagen" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          prompt: true,
          imageUrl: true,
          thumbnailUrl: true,
          width: true,
          height: true,
          model: true,
          status: true,
          createdAt: true,
          isPublic: true,
          isFavorite: true,
        },
      }),
      prisma.image.count({ where: { userId: session.user.id } }),
    ])

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching historial:", error)
    return NextResponse.json(
      { error: "Error al obtener historial" },
      { status: 500 }
    )
  }
}
