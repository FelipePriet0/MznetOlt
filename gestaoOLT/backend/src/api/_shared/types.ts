import type { IncomingMessage, ServerResponse } from 'node:http'

export type ApiRequest = IncomingMessage & {
  params: Record<string, string>
  query: Record<string, string>
  body: unknown
  user?: AuthenticatedUser
}

export type ApiResponse = ServerResponse

export type AuthenticatedUser = {
  user_id: number
  role_id: number
  role_code: string
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void>

export type RouteDefinition = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  handler: ApiHandler
  protected?: boolean
}
