export type GetOnuDetailsInput = {
  onu_serial: string
  olt_id?: number
}

export type OnuSnapshot = {
  olt_id: number
  onu_serial: string
  onu_id: number | null
  source: string
  last_known_status: string | null
  last_known_signal: number | null
  last_seen_at: string
  raw_snapshot: unknown
}

export type InternalOnu = {
  id: number
  serial_number: string
  olt_id: number
  board_id: number
  pon_port_id: number
  onu_type_id: number | null
  status: string
  admin_state: string
  last_known_signal: number | null
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export type GetOnuDetailsOutput = {
  item: { snapshot: OnuSnapshot; internal_onu: InternalOnu | null } | null
}

