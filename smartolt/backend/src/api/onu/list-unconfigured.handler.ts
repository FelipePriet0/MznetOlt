import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { listUnconfiguredOnusService } from '../../features/onu/list-unconfigured-onus/service'

export async function listUnconfiguredOnusHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const q = req.query || {}
    const olt_id = q.olt_id ? Number(q.olt_id) : undefined
    const board_id = q.board_id ? Number(q.board_id) : undefined
    const pon_port_id = q.pon_port_id ? Number(q.pon_port_id) : undefined
    const serial_number = typeof q.serial_number === 'string' ? q.serial_number : undefined
    const page = q.page ? Number(q.page) : undefined
    const page_size = q.page_size ? Number(q.page_size) : undefined

    if ((q.olt_id && Number.isNaN(olt_id)) || (q.board_id && Number.isNaN(board_id)) || (q.pon_port_id && Number.isNaN(pon_port_id))) {
      badRequest(res, 'olt_id/board_id/pon_port_id must be numbers')
      return
    }

    const result = await listUnconfiguredOnusService({ olt_id, board_id, pon_port_id, serial_number, page: page ?? 1, page_size: page_size ?? 50 })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

