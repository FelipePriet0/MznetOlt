import { findOltById } from './repository'
import { GetOltDetailsInputSchema } from './schema'
import type { GetOltDetailsInput, GetOltDetailsOutput } from './types'

export class OltNotFoundError extends Error {
  constructor() {
    super('OLT not found')
    this.name = 'OltNotFoundError'
  }
}

export async function getOltDetailsService(input: GetOltDetailsInput): Promise<GetOltDetailsOutput> {
  const parsed = GetOltDetailsInputSchema.parse(input)

  const olt = await findOltById(parsed.id)

  if (!olt) throw new OltNotFoundError()

  return {
    id: olt.id,
    name: olt.name,
    vendor: olt.vendor,
    mgmt_ip: olt.mgmt_ip,
    location_id: olt.location_id,
    location_name: olt.locations?.name ?? null,
    zone_id: olt.zone_id,
    zone_name: olt.zones?.name ?? null,
    tcp_port: olt.tcp_port,
    telnet_user: olt.telnet_user,
    telnet_password: olt.telnet_password,
    snmp_ro_community: olt.snmp_ro_community,
    snmp_rw_community: olt.snmp_rw_community,
    snmp_udp_port: olt.snmp_udp_port,
    iptv_enabled: olt.iptv_enabled,
    hw_version: olt.hw_version,
    pon_type: olt.pon_type,
    auto_backup_enabled:       olt.auto_backup_enabled       ?? false,
    show_disabled_onus:        olt.show_disabled_onus        ?? false,
    onu_description_format:    olt.onu_description_format    ?? 'long',
    use_dhcp_option82:         olt.use_dhcp_option82         ?? false,
    dhcp_option82_field:       olt.dhcp_option82_field       ?? null,
    use_dhcp_option82_mgmt:    olt.use_dhcp_option82_mgmt    ?? false,
    dhcp_option82_mgmt_field:  olt.dhcp_option82_mgmt_field  ?? null,
    use_pppoe_plus:            olt.use_pppoe_plus            ?? false,
    onu_ip_source_guard:       olt.onu_ip_source_guard       ?? false,
    use_max_mac_learn:         olt.use_max_mac_learn         ?? false,
    max_mac_per_onu:           olt.max_mac_per_onu           ?? 5,
    use_mac_allowlist:         olt.use_mac_allowlist         ?? false,
    use_mac_denylist:          olt.use_mac_denylist          ?? false,
    use_port_acl:              olt.use_port_acl              ?? false,
    port_acl_field:            olt.port_acl_field            ?? null,
    rx_warning_dbm:            olt.rx_warning_dbm            ?? -30,
    rx_critical_dbm:           olt.rx_critical_dbm           ?? -32,
    separate_voip_mgmt_hosts:  olt.separate_voip_mgmt_hosts  ?? false,
    temp_warning_celsius:      olt.temp_warning_celsius      ?? 45,
    temp_critical_celsius:     olt.temp_critical_celsius     ?? 55,
    tag_transform_mode:        olt.tag_transform_mode        ?? 'traduzir',
    use_cvlan_id:              olt.use_cvlan_id              ?? false,
    use_svlan_id:              olt.use_svlan_id              ?? false,
    created_at: olt.created_at,
    updated_at: olt.updated_at,
  }
}
