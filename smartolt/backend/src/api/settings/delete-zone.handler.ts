import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest, notFound } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function deleteZoneHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')

  try {
    const { count, error } = await supabase
      .from('zones')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw error
    if (count === 0) return notFound(res, 'Zone not found')
    ok(res, { deleted: true })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
