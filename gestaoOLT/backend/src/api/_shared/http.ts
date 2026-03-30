import type { ApiResponse } from './types'

function json(res: ApiResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

export function ok(res: ApiResponse, data: unknown): void {
  json(res, 200, data)
}

export function created(res: ApiResponse, data: unknown): void {
  json(res, 201, data)
}

export function noContent(res: ApiResponse): void {
  res.writeHead(204)
  res.end()
}

export function badRequest(res: ApiResponse, message: string): void {
  json(res, 400, { error: 'bad_request', message })
}

export function unauthorized(res: ApiResponse, message = 'Unauthorized'): void {
  json(res, 401, { error: 'unauthorized', message })
}

export function forbidden(res: ApiResponse, message = 'Forbidden'): void {
  json(res, 403, { error: 'forbidden', message })
}

export function notFound(res: ApiResponse, message = 'Not found'): void {
  json(res, 404, { error: 'not_found', message })
}

export function conflict(res: ApiResponse, message: string): void {
  json(res, 409, { error: 'conflict', message })
}

export function unprocessable(res: ApiResponse, message: string): void {
  json(res, 422, { error: 'unprocessable', message })
}

export function serverError(res: ApiResponse, message = 'Internal server error'): void {
  json(res, 500, { error: 'server_error', message })
}
