'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api/client'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router    = useRouter()
  const { login } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      router.replace('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? 'E-mail ou senha inválidos.' : err.message)
      } else {
        setError('Sem conexão com o servidor. Verifique se o backend está rodando.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse w-full bg-zinc-900">

      {/* ── Coluna formulário ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-6">
            <Image
              src="/logo-mznet.png"
              alt="MZ NET"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Seja Bem-Vindo
            </h2>
            <p className="text-sm" style={{ color: '#888888' }}>
              Acesse sua conta e continue sua jornada
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* E-mail */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium"
                style={{ color: '#cccccc' }}
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#1e1e1e',
                  border: error ? '1px solid #ef4444' : '1px solid #2e2e2e',
                  color: '#ffffff',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#00783C' }}
                onBlur={e => { e.currentTarget.style.borderColor = error ? '#ef4444' : '#2e2e2e' }}
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium"
                style={{ color: '#cccccc' }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg px-4 py-3 pr-11 text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#1e1e1e',
                    border: error ? '1px solid #ef4444' : '1px solid #2e2e2e',
                    color: '#ffffff',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#00783C' }}
                  onBlur={e => { e.currentTarget.style.borderColor = error ? '#ef4444' : '#2e2e2e' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#666666' }}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all"
              style={{
                backgroundColor: loading ? '#005a2d' : '#00783C',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#009950' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#00783C' }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs" style={{ color: '#444444' }}>
            Sistema protegido — acesso somente para usuários autorizados
          </p>
        </div>
      </div>

      {/* ── Coluna visual (hero) ─────────────────────── */}
      <div className="hidden md:block flex-1 relative p-4">
        {/* Contêiner base */}
        <section className="relative h-full">
          {/* Card / máscara */}
          <div className="absolute inset-4 rounded-3xl overflow-hidden shadow-lg">
            {/* Fundo com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00783C] via-zinc-950 to-[#00783C]" />

            {/* Blobs decorativos */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-800 rounded-full blur-3xl opacity-20 animate-pulse [animation-delay:1000ms]" />

            {/* Conteúdo (logo) */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <Image
                src="/logo-mznet.png"
                alt="MZ NET"
                width={220}
                height={220}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </section>
      </div>

    </div>
  )
}
