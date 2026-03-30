import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { listOnusService } from '../../features/onu/list-onus/service'

export async function listOnusHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const q = req.query
  const olt_id = q.olt_id ? Number(q.olt_id) : undefined
  const board_id = q.board_id ? Number(q.board_id) : undefined
  const pon_port_id = q.pon_port_id ? Number(q.pon_port_id) : undefined
  const status = q.status || undefined
  const admin_state = q.admin_state || undefined
  const serial_number = q.serial_number || undefined
  const search = q.search || undefined
  const zone_id = q.zone_id ? Number(q.zone_id) : undefined
  const onu_type_id = q.onu_type_id ? Number(q.onu_type_id) : undefined
  const toNumArr  = (v: unknown) => v ? String(v).split(',').filter(Boolean).map(Number) : undefined
  const toStrArr  = (v: unknown) => v ? String(v).split(',').filter(Boolean) : undefined
  const toBool    = (v: unknown) => v === 'true' ? true : v === 'false' ? false : undefined
  const olt_ids         = toNumArr(q.olt_ids)
  const board_ids       = toNumArr(q.board_ids)
  const pon_port_ids    = toNumArr(q.pon_port_ids)
  const zone_ids        = toNumArr(q.zone_ids)
  const onu_type_ids    = toNumArr(q.onu_type_ids)
  const pon_type_in     = toStrArr(q.pon_type_in)
  const vlan_ids        = toNumArr(q.vlan_ids)
  const mode_in         = toStrArr(q.mode_in)
  const download_profiles = toStrArr(q.download_profiles)
  const upload_profiles   = toStrArr(q.upload_profiles)
  const profile_in      = toStrArr(q.profile_in)
  const tr069_enabled   = toBool(q.tr069_enabled)
  const catv_enabled    = toBool(q.catv_enabled)
  const mgmt_ip_filter  = (q.mgmt_ip_filter === 'with' || q.mgmt_ip_filter === 'without') ? q.mgmt_ip_filter : undefined
  const odb_filter      = (q.odb_filter === 'with' || q.odb_filter === 'without') ? q.odb_filter : undefined
  const status_in = q.status_in ? String(q.status_in).split(',').filter(Boolean) : undefined
  const admin_state_in = q.admin_state_in ? String(q.admin_state_in).split(',').filter(Boolean) : undefined
  const signal_levels = q.signal_levels ? String(q.signal_levels).split(',').filter(Boolean) as ('good'|'warning'|'critical')[] : undefined
  const page = q.page ? Number(q.page) : 1
  const page_size = q.page_size ? Number(q.page_size) : 50

  try {
    const result = await listOnusService({
      olt_id, board_id, pon_port_id,
      status, admin_state, serial_number, search,
      zone_id, onu_type_id,
      olt_ids, board_ids, pon_port_ids, zone_ids, onu_type_ids,
      pon_type_in, vlan_ids, mode_in,
      download_profiles, upload_profiles, profile_in,
      tr069_enabled, catv_enabled,
      mgmt_ip_filter, odb_filter,
      status_in, admin_state_in, signal_levels,
      page, page_size,
    })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
