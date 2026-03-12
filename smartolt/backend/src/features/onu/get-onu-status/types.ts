export type GetOnuStatusInput = { id: number }

export type OnuStatusOutput = {
  id: number
  status: string
  admin_state: string
  last_seen_at: string | null
}

