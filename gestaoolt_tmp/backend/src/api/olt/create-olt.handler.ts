import type { ApiRequest, ApiResponse } from '../_shared/types'
import { created, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { createOltService } from '../../features/olt/create-olt/service'

export async function createOltHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const body = req.body as Record<string, unknown>

  const name    = typeof body?.name    === 'string' ? body.name.trim()    : null
  const vendor  = typeof body?.vendor  === 'string' ? body.vendor.trim()  : null
  const mgmt_ip = typeof body?.mgmt_ip === 'string' ? body.mgmt_ip.trim() : null

  if (!name || !vendor || !mgmt_ip) {
    badRequest(res, 'name, vendor e mgmt_ip são obrigatórios')
    return
  }

  try {
    const result = await createOltService({
      name,
      vendor,
      mgmt_ip,
      location_id:       typeof body.location_id === 'number' ? body.location_id : null,
      zone_id:           typeof body.zone_id      === 'number' ? body.zone_id      : null,
      tcp_port:          typeof body.tcp_port      === 'number' ? body.tcp_port      : undefined,
      telnet_user:       typeof body.telnet_user   === 'string' ? body.telnet_user   : undefined,
      telnet_password:   typeof body.telnet_password === 'string' ? body.telnet_password : undefined,
      snmp_ro_community: typeof body.snmp_ro_community === 'string' ? body.snmp_ro_community : undefined,
      snmp_rw_community: typeof body.snmp_rw_community === 'string' ? body.snmp_rw_community : undefined,
      snmp_udp_port:     typeof body.snmp_udp_port === 'number' ? body.snmp_udp_port : undefined,
      iptv_enabled:      typeof body.iptv_enabled === 'boolean' ? body.iptv_enabled : undefined,
      hw_version:        typeof body.hw_version === 'string' ? body.hw_version : undefined,
      pon_type:          body.pon_type === 'GPON' || body.pon_type === 'EPON' || body.pon_type === 'GPON+EPON'
                           ? body.pon_type : undefined,
    })
    created(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
