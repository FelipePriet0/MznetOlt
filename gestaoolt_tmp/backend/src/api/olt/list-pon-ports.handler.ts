import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { listPonPortsByBoardService } from '../../features/olt/list-pon-ports/service'

export async function listPonPortsByBoardHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  try {
    const items = await listPonPortsByBoardService({ board_id: id })
    ok(res, { items })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

