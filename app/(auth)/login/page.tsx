import { Suspense } from "react"
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
