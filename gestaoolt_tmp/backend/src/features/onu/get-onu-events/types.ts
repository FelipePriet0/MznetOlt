export type OnuEventItem = {
  id: number
  event_type: string
  created_at: string
}

export type GetOnuEventsInput = {
  onu_id: number
  limit?: number
}

export type GetOnuEventsOutput = {
  items: OnuEventItem[]
}
