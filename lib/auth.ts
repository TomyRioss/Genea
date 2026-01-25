import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("El email es requerido")
        }

        if (!credentials?.password) {
          throw new Error("La contraseña es requerida")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          throw new Error("No existe una cuenta con este email")
        }

        if (!user.password) {
          throw new Error("Esta cuenta usa inicio de sesión con Google")
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValidPassword) {
          throw new Error("La contraseña es incorrecta")
        }

        if (!user.emailVerified) {
          throw new Error("Verificá tu email antes de iniciar sesión")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              name: user.name,
              avatarUrl: user.image,
              emailVerified: new Date(),
              credits: 450,
            },
          })
        } else if (!existingUser.emailVerified) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() },
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { credits: true, avatarUrl: true, name: true },
        })
        if (dbUser) {
          token.credits = dbUser.credits
          token.picture = dbUser.avatarUrl
          token.name = dbUser.name
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.credits = token.credits as number
        session.user.image = token.picture as string | null
        session.user.name = token.name as string | null
      }
      return session
    },
  },
})
