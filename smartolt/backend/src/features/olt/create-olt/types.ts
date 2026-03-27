export type CreateOltInput = {
  name:               string
  vendor:             string
  mgmt_ip:            string
  location_id?:       number | null
  zone_id?:           number | null
  tcp_port?:          number
  telnet_user?:       string | null
  telnet_password?:   string | null
  snmp_ro_community?: string | null
  snmp_rw_community?: string | null
  snmp_udp_port?:     number
  iptv_enabled?:      boolean
  hw_version?:        string | null
  pon_type?:          'GPON' | 'EPON' | 'GPON+EPON'
}

export type CreateOltOutput = {
  id:                number
  name:              string
  vendor:            string
  mgmt_ip:           string
  location_id:       number | null
  zone_id:           number | null
  tcp_port:          number
  telnet_user:       string | null
  telnet_password:   string | null
  snmp_ro_community: string | null
  snmp_rw_community: string | null
  snmp_udp_port:     number
  iptv_enabled:      boolean
  hw_version:        string | null
  pon_type:          string
  created_at:        string
  updated_at:        string
}
