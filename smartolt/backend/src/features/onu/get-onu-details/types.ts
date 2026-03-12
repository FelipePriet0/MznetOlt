export type GetOnuDetailsInput = {
  id: number
}

export type OnuDetailsOutput = {
  id:                number
  serial_number:     string
  status:            string
  admin_state:       string
  last_known_signal: number | null
  last_seen_at:      string | null
  olt_id:            number
  olt_name:          string
  board_id:          number
  board_name:        string
  board_slot_index:  number
  pon_port_id:       number
  pon_port_name:     string
  pon_index:         number
  onu_type_id:       number | null
  onu_vendor:        string | null
  onu_model:         string | null
  created_at:        string
  updated_at:        string
}

