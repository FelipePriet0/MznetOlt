export type OnuItem = {
  id: number
  serial_number: string
  status: string
  admin_state: string
  last_known_signal: number | null
  last_seen_at: string | null
  olt_id: number
  olt_name: string
  board_id: number
  board_name: string
  pon_port_id: number
  pon_port_name: string
  onu_type_id: number | null
  onu_vendor: string | null
  onu_model: string | null
  created_at: string
}

export type ListOnusInput = {
  olt_id?: number
  board_id?: number
  pon_port_id?: number
  status?: string
  admin_state?: string
  serial_number?: string
  page?: number
  page_size?: number
}

export type ListOnusOutput = {
  items: OnuItem[]
  total: number
  page: number
  page_size: number
}

export type OnuRow = {
  id: number
  serial_number: string
  status: string
  admin_state: string
  last_known_signal: number | null
  last_seen_at: string | null
  olt_id: number
  board_id: number
  pon_port_id: number
  onu_type_id: number | null
  created_at: string
  olts: { name: string }
  boards: { name: string }
  pon_ports: { name: string }
  onu_types: { vendor: string; model: string } | null
}
