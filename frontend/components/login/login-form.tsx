'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UtensilsCrossed, Eye, EyeOff, Loader2 } from 'lucide-react'
import { login, fetchMe, extractErrorMessage } from '@/lib/api'
import { setCurrentUser } from '@/lib/auth'

export function LoginForm() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const authResponse = await login(correo, password)
      try {
        const user = await fetchMe()
        setCurrentUser(user)
      } catch {
      }

      if (authResponse.rol === 'Supervisor Municipal') {
        router.push('/reportes')
      } else {
        router.push('/')
      }
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl sm:p-10"
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <UtensilsCrossed className="size-9" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          Acceso al Sistema
        </p>
        <h1 className="font-heading text-3xl font-extrabold text-balance text-card-foreground">
          Comedor Comunitario
        </h1>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive"
        >
          {error}
        </div>
      )}

      <div className="mb-5">
        <label
          htmlFor="correo"
          className="mb-2 block text-base font-bold text-card-foreground"
        >
          Correo Electrónico
        </label>
        <input
          id="correo"
          type="email"
          autoComplete="username"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="admin@comedor.gob"
          className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-lg font-semibold text-foreground shadow-sm transition-colors placeholder:font-normal placeholder:text-muted-foreground hover:border-primary/50 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <div className="mb-8">
        <label
          htmlFor="password"
          className="mb-2 block text-base font-bold text-card-foreground"
        >
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
            className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 pr-14 text-lg font-semibold text-foreground shadow-sm transition-colors placeholder:font-normal placeholder:text-muted-foreground hover:border-primary/50 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex w-14 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {showPassword ? (
              <EyeOff className="size-6" aria-hidden="true" />
            ) : (
              <Eye className="size-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-16 w-full items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-7 animate-spin" aria-hidden="true" />
        ) : (
          'Iniciar Sesión'
        )}
      </button>
    </form>
  )
}