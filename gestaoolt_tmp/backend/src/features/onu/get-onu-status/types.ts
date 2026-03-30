export type GetOnuStatusInput = { id: number }

export type OnuStatusOutput = {
  id: number
  status: string
  admin_state: string
  last_seen_at: string | null
  // Óptico
  rx_dbm: number | null
  tx_dbm: number | null
  signal_ts: string | null
  // Cadastro
  serial_number: string | null
  name: string | null
  mgmt_ip: string | null
  tr069_enabled: boolean | null
  catv_enabled: boolean | null
  voip_enabled: boolean | null
  mode: string | null
  vlan_id: number | null
  download_profile: string | null
  upload_profile: string | null
  service_port_id: number | null
  created_at: string
  // Posição
  onu_index: number | null
}
