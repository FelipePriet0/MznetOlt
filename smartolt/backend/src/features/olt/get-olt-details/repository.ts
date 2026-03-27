import { supabase } from '@/shared/lib/supabase'
import type { OltDetailsRow } from './types'

export async function findOltById(id: number): Promise<OltDetailsRow | null> {
  const { data, error } = await supabase
    .from('olts')
    .select('id, name, vendor, mgmt_ip, location_id, zone_id, tcp_port, telnet_user, telnet_password, snmp_ro_community, snmp_rw_community, snmp_udp_port, iptv_enabled, hw_version, pon_type, show_disabled_onus, onu_description_format, use_dhcp_option82, dhcp_option82_field, use_dhcp_option82_mgmt, dhcp_option82_mgmt_field, use_pppoe_plus, onu_ip_source_guard, use_max_mac_learn, max_mac_per_onu, use_mac_allowlist, use_mac_denylist, use_port_acl, port_acl_field, rx_warning_dbm, rx_critical_dbm, separate_voip_mgmt_hosts, temp_warning_celsius, temp_critical_celsius, tag_transform_mode, use_cvlan_id, use_svlan_id, created_at, updated_at, locations(name), zones(name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as unknown as OltDetailsRow
}
