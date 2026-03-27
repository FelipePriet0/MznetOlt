import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { listBoardsByOltService } from '../../features/olt/list-boards/service'

export async function listBoardsByOltHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  try {
    const items = await listBoardsByOltService({ olt_id: id })
    ok(res, { items })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

