export type OnuItem = {
  id: number
  serial_number: string
  name: string | null
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
  zone_name?: string | null
  onu_index?: number | null
  mode?: string | null
  vlan_id?: number | null
  tr069_enabled?: boolean | null
  catv_enabled?: boolean | null
  voip_enabled?: boolean | null
  odb_splitter?: string | null
  odb_name?: string | null
  created_at: string
}

export type ListOnusInput = {
  olt_id?: number
  board_id?: number
  pon_port_id?: number
  status?: string
  admin_state?: string
  serial_number?: string
  search?: string
  zone_id?: number
  onu_type_id?: number
  // Multi-select topology
  olt_ids?: number[]
  board_ids?: number[]
  pon_port_ids?: number[]
  zone_ids?: number[]
  onu_type_ids?: number[]
  // Service column filters
  pon_type_in?: string[]
  vlan_ids?: number[]
  mode_in?: string[]
  download_profiles?: string[]
  upload_profiles?: string[]
  profile_in?: string[]
  tr069_enabled?: boolean
  catv_enabled?: boolean
  mgmt_ip_filter?: 'with' | 'without'
  odb_filter?: 'with' | 'without'
  // Status/signal
  status_in?: string[]
  admin_state_in?: string[]
  signal_levels?: ('good' | 'warning' | 'critical')[]
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
  name: string | null
  status: string
  admin_state: string
  last_known_signal: number | null
  last_seen_at: string | null
  olt_id: number
  board_id: number
  pon_port_id: number
  onu_type_id: number | null
  onu_index: number | null
  mode: string | null
  vlan_id: number | null
  tr069_enabled: boolean | null
  catv_enabled: boolean | null
  voip_enabled: boolean | null
  odb_splitter: string | null
  odb_id: number | null
  created_at: string
  olts: { name: string; zones?: { name: string } | null }
  boards: { name: string }
  pon_ports: { name: string }
}
