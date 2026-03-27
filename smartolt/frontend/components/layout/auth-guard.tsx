'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuth() as any
  const router = useRouter()
  const lsToken = useMemo(() => {
    if (typeof window === 'undefined') return null
    try { return localStorage.getItem('smartolt_token') } catch { return null }
  }, [])

  useEffect(() => {
    // Só redireciona se não estiver carregando E não houver usuário nem token (sem sessão mesmo)
    if (!isLoading && !user && !token && !lsToken) {
      router.replace('/login')
    }
  }, [user, token, lsToken, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Se há token mas ainda não carregou o user (por erro transitório), permite renderizar.
  if (!user && (token || lsToken)) return <>{children}</>

  return <>{children}</>
}
