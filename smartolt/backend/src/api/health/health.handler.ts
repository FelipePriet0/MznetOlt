import type { ApiRequest, ApiResponse } from '../_shared/types'

export async function healthHandler(_req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json')
  res.writeHead(200)
  res.end(JSON.stringify({ ok: true, service: 'smartolt-backend' }))
}

