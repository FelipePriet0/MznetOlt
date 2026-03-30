import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function updateOltHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')

  const body = req.body as Record<string, unknown>
  const allowed = [
    'name', 'vendor', 'mgmt_ip', 'location_id', 'zone_id',
    'tcp_port', 'telnet_user', 'telnet_password',
    'snmp_ro_community', 'snmp_rw_community', 'snmp_udp_port',
    'iptv_enabled', 'hw_version', 'pon_type', 'auto_backup_enabled',
    'show_disabled_onus', 'onu_description_format',
    'use_dhcp_option82', 'dhcp_option82_field',
    'use_dhcp_option82_mgmt', 'dhcp_option82_mgmt_field',
    'use_pppoe_plus', 'onu_ip_source_guard', 'use_max_mac_learn', 'max_mac_per_onu',
    'use_mac_allowlist', 'use_mac_denylist',
    'use_port_acl', 'port_acl_field',
    'rx_warning_dbm', 'rx_critical_dbm',
    'separate_voip_mgmt_hosts', 'temp_warning_celsius', 'temp_critical_celsius',
    'tag_transform_mode', 'use_cvlan_id', 'use_svlan_id',
  ]
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) patch[key] = body[key]
  }

  if (Object.keys(patch).length === 0) return badRequest(res, 'No fields to update')

  try {
    const { error } = await supabase.from('olts').update(patch).eq('id', id)
    if (error) throw error
    ok(res, { updated: true })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
