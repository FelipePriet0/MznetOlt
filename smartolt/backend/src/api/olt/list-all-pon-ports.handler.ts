import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { listPonPortsByBoardService } from '../../features/olt/list-pon-ports/service'

export async function listAllPonPortsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const items = await listPonPortsByBoardService({})
    ok(res, { items })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
