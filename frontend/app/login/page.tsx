import type { Metadata } from 'next'
import { LoginForm } from '@/components/login/login-form'

export const metadata: Metadata = {
  title: 'Acceso al Sistema | Comedor Comunitario',
  description:
    'Inicie sesión en el sistema de gestión del Comedor Comunitario.',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-accent px-4 py-10">
      <LoginForm />
    </main>
  )
}
