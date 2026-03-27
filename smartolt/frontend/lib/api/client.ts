let CACHED_BASE_URL: string | null = null
const IS_DEV = process.env.NODE_ENV === 'development'

async function discoverBaseUrl(): Promise<string> {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  // 1) Explicit env
  const envUrl = process.env.NEXT_PUBLIC_API_URL
  if (envUrl) return envUrl
  // 2) Cache/localStorage
  const fromLS = localStorage.getItem('api_base_url')
  if (fromLS) return fromLS
  if (IS_DEV) {
    // 3) Try same-origin /health (dev server reverse-proxy or same origin)
    try {
      const r = await fetch('/health', { method: 'GET' })
      if (r.ok) {
        const u = window.location.origin
        localStorage.setItem('api_base_url', u)
        return u
      }
    } catch {}
    // 4) Probe common localhost ports
    const candidates = ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3002']
    for (const base of candidates) {
      try {
        const r = await fetch(`${base}/health`, { method: 'GET' })
        if (r.ok) {
          localStorage.setItem('api_base_url', base)
          return base
        }
      } catch {}
    }
  }
  return 'http://localhost:3001'
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('smartolt_token')
}

interface FetchOptions extends RequestInit {
  auth?: boolean
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = true, headers: customHeaders, ...rest } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  }

  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  if (!CACHED_BASE_URL) {
    CACHED_BASE_URL = await discoverBaseUrl()
  }
  let res: Response
  try {
    res = await fetch(`${CACHED_BASE_URL}${path}`, { headers, ...rest })
  } catch (err) {
    // Network error: clear cached baseUrl and retry discovery once (camaleão)
    if (typeof window !== 'undefined') localStorage.removeItem('api_base_url')
    CACHED_BASE_URL = await discoverBaseUrl()
    res = await fetch(`${CACHED_BASE_URL}${path}`, { headers, ...rest })
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      message = body?.message ?? body?.error ?? message
    } catch {}
    // On auth/network errors, clear base_url to allow future rediscovery
    if (typeof window !== 'undefined' && (res.status === 401 || res.status === 404 || res.status === 503)) {
      localStorage.removeItem('api_base_url')
    }
    throw new ApiError(res.status, message)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}
