'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, type AuthUser } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'

const TOKEN_KEY = 'smartolt_token'
const USER_KEY  = 'smartolt_user'

interface AuthContextValue {
  user:      AuthUser | null
  token:     string | null
  isLoading: boolean
  login:     (email: string, password: string) => Promise<void>
  logout:    () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null)
  const [token,     setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Bootstrap: restore session from localStorage immediately, then refresh in background
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) { setIsLoading(false); return }

    // Restore cached user instantly so AuthGuard never redirects on F5
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)) } catch {}
    }
    setToken(storedToken)
    setIsLoading(false)

    // Silently refresh user data in background; only logout on explicit 401/403
    authApi.me()
      .then(me => { setUser(me); localStorage.setItem(USER_KEY, JSON.stringify(me)) })
      .catch((err: unknown) => {
        const status = (err as ApiError)?.status ?? null
        if (status === 401 || status === 403) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken(null)
          setUser(null)
        }
        // Any other error (network, 500): keep the session alive
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await authApi.login(email, password)
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
