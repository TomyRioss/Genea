import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email y código son requeridos" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email ya verificado" },
        { status: 400 }
      )
    }

    if (
      !user.verificationCode ||
      !user.verificationCodeExpires ||
      user.verificationCode !== code
    ) {
      return NextResponse.json(
        { error: "Código inválido" },
        { status: 400 }
      )
    }

    if (new Date() > user.verificationCodeExpires) {
      return NextResponse.json(
        { error: "Código expirado" },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationCodeExpires: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    )
  }
}
