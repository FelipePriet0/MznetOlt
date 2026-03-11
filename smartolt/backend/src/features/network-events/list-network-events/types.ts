export type ListNetworkEventsInput = {
  olt_id?: number
  onu_serial?: string
  event_type?: string
  limit?: number
}

export type NetworkEventRow = {
  id: number
  olt_id: number
  onu_id: number | null
  onu_serial: string
  event_type: string
  previous_state: unknown | null
  current_state: unknown | null
  payload: unknown | null
  created_at: string
}

export type ListNetworkEventsOutput = {
  events: NetworkEventRow[]
}

