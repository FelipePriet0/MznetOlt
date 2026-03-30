export type ListAuthorizationsInput = {}

export type AuthorizationItem = {
  id: number
  onu_id: number
  status: string
  created_at: string
  payload_json: unknown
}

export type ListAuthorizationsOutput = {
  items: AuthorizationItem[]
}

