export type GetOltDetailsInput = {
  id: number
}

export type GetOltDetailsOutput = {
  id: number
  name: string
  vendor: string
  mgmt_ip: string
  location_id: number | null
  location_name: string | null
  zone_id: number | null
  zone_name: string | null
  tcp_port: number
  telnet_user: string | null
  telnet_password: string | null
  snmp_ro_community: string | null
  snmp_rw_community: string | null
  snmp_udp_port: number
  iptv_enabled: boolean
  hw_version: string | null
  pon_type: string
  auto_backup_enabled: boolean
  show_disabled_onus: boolean
  onu_description_format: string
  use_dhcp_option82: boolean
  dhcp_option82_field: string | null
  use_dhcp_option82_mgmt: boolean
  dhcp_option82_mgmt_field: string | null
  use_pppoe_plus: boolean
  onu_ip_source_guard: boolean
  use_max_mac_learn: boolean
  max_mac_per_onu: number
  use_mac_allowlist: boolean
  use_mac_denylist: boolean
  use_port_acl: boolean
  port_acl_field: string | null
  rx_warning_dbm: number
  rx_critical_dbm: number
  separate_voip_mgmt_hosts: boolean
  temp_warning_celsius: number
  temp_critical_celsius: number
  tag_transform_mode: string
  use_cvlan_id: boolean
  use_svlan_id: boolean
  created_at: string
  updated_at: string
}

export type OltDetailsRow = {
  id: number
  name: string
  vendor: string
  mgmt_ip: string
  location_id: number | null
  zone_id: number | null
  tcp_port: number
  telnet_user: string | null
  telnet_password: string | null
  snmp_ro_community: string | null
  snmp_rw_community: string | null
  snmp_udp_port: number
  iptv_enabled: boolean
  hw_version: string | null
  pon_type: string
  auto_backup_enabled?: boolean
  show_disabled_onus?: boolean
  onu_description_format?: string
  use_dhcp_option82?: boolean
  dhcp_option82_field?: string | null
  use_dhcp_option82_mgmt?: boolean
  dhcp_option82_mgmt_field?: string | null
  use_pppoe_plus?: boolean
  onu_ip_source_guard?: boolean
  use_max_mac_learn?: boolean
  max_mac_per_onu?: number
  use_mac_allowlist?: boolean
  use_mac_denylist?: boolean
  use_port_acl?: boolean
  port_acl_field?: string | null
  rx_warning_dbm?: number
  rx_critical_dbm?: number
  separate_voip_mgmt_hosts?: boolean
  temp_warning_celsius?: number
  temp_critical_celsius?: number
  tag_transform_mode?: string
  use_cvlan_id?: boolean
  use_svlan_id?: boolean
  created_at: string
  updated_at: string
  locations: { name: string } | null
  zones: { name: string } | null
}
