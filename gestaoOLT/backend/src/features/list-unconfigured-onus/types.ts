export type ListUnconfiguredOnusInput = {
  olt_id?: number
  onu_serial?: string
  last_seen_at_from?: string
  last_seen_at_to?: string
  limit?: number
  offset?: number
}

export type UnconfiguredOnuItem = {
  olt_id: number
  onu_serial: string
  onu_id: number | null
  last_known_status: string | null
  last_known_signal: number | null
  last_seen_at: string
}

export type ListUnconfiguredOnusOutput = {
  items: UnconfiguredOnuItem[]
}

