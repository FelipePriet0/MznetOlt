import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function deleteOltHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')

  try {
    const { error } = await supabase.from('olts').delete().eq('id', id)
    if (error) throw error
    ok(res, { deleted: true })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
