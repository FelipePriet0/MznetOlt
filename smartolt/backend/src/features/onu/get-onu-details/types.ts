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
  board_slot_index:  number | null
  pon_port_id:       number
  pon_port_name:     string
  pon_index:         number | null
  onu_index:         number | null
  onu_type_id:       number | null
  onu_vendor:        string | null
  onu_model:         string | null
  // extended metadata
  name:              string | null
  address?:          string | null
  contact?:          string | null
  external_id?:      string | null
  latitude?:         number | null
  longitude?:        number | null
  pon_type?:         string | null
  mode?:             string | null
  vlan_id?:          number | null
  tr069_enabled?:    boolean | null
  voip_enabled?:     boolean | null
  catv_enabled?:     boolean | null
  mgmt_ip?:          string | null
  odb_id?:           number | null
  odb_name?:         string | null
  zone_id?:          number | null
  zone_name?:        string | null
  odb_port?:         string | null
  tr069_profile?:    string | null
  service_port_id?:  number | null
  download_profile?: string | null
  upload_profile?:   string | null
  created_at:        string
  updated_at:        string
}
