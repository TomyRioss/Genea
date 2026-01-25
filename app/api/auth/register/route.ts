import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail, generateVerificationCode } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    if (!email) {
      return NextResponse.json(
        { error: "El email es requerido" },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: "La contraseña es requerida" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El formato del email no es válido" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    const verificationCode = generateVerificationCode()
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000)

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: "Este email ya está registrado. ¿Querés iniciar sesión?" },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name: name || existingUser.name,
          verificationCode,
          verificationCodeExpires,
        },
      })

      await sendVerificationEmail(email, verificationCode)
      return NextResponse.json({ success: true, resent: true })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        credits: 450,
        verificationCode,
        verificationCodeExpires,
      },
    })

    await sendVerificationEmail(email, verificationCode)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en registro:", error)
    const message = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      { error: `Error al crear la cuenta: ${message}` },
      { status: 500 }
    )
  }
}
