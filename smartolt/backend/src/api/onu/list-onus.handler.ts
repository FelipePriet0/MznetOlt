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
  const page = q.page ? Number(q.page) : 1
  const page_size = q.page_size ? Number(q.page_size) : 50

  try {
    const result = await listOnusService({
      olt_id,
      board_id,
      pon_port_id,
      status,
      admin_state,
      serial_number,
      page,
      page_size,
    })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
