import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { listBoardsByOltService } from '../../features/olt/list-boards/service'

export async function listAllBoardsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const items = await listBoardsByOltService({})
    ok(res, { items })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
