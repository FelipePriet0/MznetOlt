import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ApiRequest, ApiResponse, RouteDefinition } from './_shared/types'
import { unauthorized, notFound, serverError } from './_shared/http'
import { extractUser } from './_shared/auth'

import { authRoutes } from './auth/routes'
import { dashboardRoutes } from './dashboard/routes'
import { onuRoutes } from './onu/routes'
import { oltRoutes } from './olt/routes'
import { authorizationRoutes } from './authorization/routes'
import { settingsRoutes } from './settings/routes'

const allRoutes: RouteDefinition[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...onuRoutes,
  ...oltRoutes,
  ...authorizationRoutes,
  ...settingsRoutes,
]

function parsePath(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\:([a-zA-Z_][a-zA-Z0-9_]*)/g, '(?<$1>[^/]+)')
  return new RegExp(`^${escaped}$`)
}

function parseQuery(search: string): Record<string, string> {
  const params: Record<string, string> = {}
  if (!search) return params
  const s = search.startsWith('?') ? search.slice(1) : search
  for (const pair of s.split('&')) {
    const [k, v] = pair.split('=')
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '')
  }
  return params
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString()
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

export function createApiServer() {
  const compiledRoutes = allRoutes.map((route) => ({
    ...route,
    regex: parsePath(route.path),
  }))

  const server = createServer(async (rawReq: IncomingMessage, rawRes: ServerResponse) => {
    setCorsHeaders(rawRes)

    if (rawReq.method === 'OPTIONS') {
      rawRes.writeHead(204)
      rawRes.end()
      return
    }

    const urlObj = new URL(rawReq.url ?? '/', `http://localhost`)
    const pathname = urlObj.pathname
    const method = rawReq.method?.toUpperCase() ?? 'GET'

    for (const route of compiledRoutes) {
      if (route.method !== method) continue
      const match = route.regex.exec(pathname)
      if (!match) continue

      const req = rawReq as ApiRequest
      const res = rawRes as ApiResponse
      req.params = match.groups ?? {}
      req.query = parseQuery(urlObj.search)
      req.body = await readBody(rawReq)

      if (route.protected !== false) {
        const user = extractUser(req)
        if (!user) {
          unauthorized(res)
          return
        }
        req.user = user
      }

      try {
        await route.handler(req, res)
      } catch (err) {
        console.error('[Server] Unhandled error in handler:', err)
        serverError(res)
      }
      return
    }

    notFound(rawRes as ApiResponse, `Cannot ${method} ${pathname}`)
  })

  return server
}
