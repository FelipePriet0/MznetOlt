'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, type AuthUser } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'

const TOKEN_KEY_NEW = 'mznetolt_token'
const USER_KEY_NEW  = 'mznetolt_user'
const TOKEN_KEY_OLD = 'smartolt_token'
const USER_KEY_OLD  = 'smartolt_user'

interface AuthContextValue {
  user:      AuthUser | null
  token:     string | null
  isLoading: boolean
  login:     (email: string, password: string) => Promise<void>
  logout:    () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Bootstrap from localStorage synchronamente no primeiro render
  const initialToken = typeof window !== 'undefined'
    ? (localStorage.getItem(TOKEN_KEY_NEW) || localStorage.getItem(TOKEN_KEY_OLD))
    : null
  const initialUser  = typeof window !== 'undefined'
    ? (() => {
        try {
          const raw = localStorage.getItem(USER_KEY_NEW) || localStorage.getItem(USER_KEY_OLD)
          return JSON.parse(raw || 'null')
        } catch { return null }
      })()
    : null
  const [user,      setUser]      = useState<AuthUser | null>(initialUser)
  const [token,     setToken]     = useState<string | null>(initialToken)
  const [isLoading, setIsLoading] = useState<boolean>(!!initialToken && !initialUser)

  // Refresh em background quando há token
  useEffect(() => {
    if (!token) { setIsLoading(false); return }
    authApi.me()
      .then(me => { setUser(me); localStorage.setItem(USER_KEY, JSON.stringify(me)) })
      .catch((_err: unknown) => {
        // Não limpe a sessão automaticamente, mesmo em 401/403.
        // Em dev, preferimos manter o token até logout explícito.
      })
      .finally(() => setIsLoading(false))
  // run when token changes (e.g., after login)
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await authApi.login(email, password)
    localStorage.setItem(TOKEN_KEY_NEW, newToken)
    localStorage.setItem(USER_KEY_NEW, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY_NEW)
    localStorage.removeItem(USER_KEY_NEW)
    localStorage.removeItem(TOKEN_KEY_OLD)
    localStorage.removeItem(USER_KEY_OLD)
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
