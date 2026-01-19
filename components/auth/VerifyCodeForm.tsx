"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function VerifyCodeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || "Error al verificar")
      return
    }

    const pendingAuth = sessionStorage.getItem("pending_auth")
    if (pendingAuth) {
      const { email: authEmail, password } = JSON.parse(pendingAuth)
      sessionStorage.removeItem("pending_auth")

      const result = await signIn("credentials", {
        email: authEmail,
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.push("/")
        router.refresh()
        return
      }
    }

    router.push("/login?verified=true")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verificar Email</CardTitle>
        <CardDescription>
          Ingresa el código de 6 dígitos enviado a {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Código de verificación</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
