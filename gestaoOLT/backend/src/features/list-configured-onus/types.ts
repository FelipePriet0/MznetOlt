export type ListConfiguredOnusInput = {
  olt_id?: number
  last_known_status?: string
  onu_serial?: string
  limit?: number
  offset?: number
}

export type ConfiguredOnuItem = {
  olt_id: number
  onu_serial: string
  onu_id: number | null
  last_known_status: string | null
  last_known_signal: number | null
  last_seen_at: string
}

export type ListConfiguredOnusOutput = {
  items: ConfiguredOnuItem[]
}

