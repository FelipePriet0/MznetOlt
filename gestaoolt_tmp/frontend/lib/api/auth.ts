import { apiFetch } from './client'

export type AuthUser = {
  id: number
  name: string
  email: string
  role_code: string
}

export type LoginResponse = {
  token: string
  user: AuthUser
}

export type MeResponse = AuthUser

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    }),

  me: () => apiFetch<MeResponse>('/api/auth/me'),
}
