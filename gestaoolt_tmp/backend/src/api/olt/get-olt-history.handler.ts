import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function getOltHistoryHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')

  const page      = Math.max(1, Number(req.query?.page ?? 1))
  const page_size = Math.min(100, Math.max(1, Number(req.query?.page_size ?? 50)))
  const offset    = (page - 1) * page_size

  try {
    const { data, error, count } = await supabase
      .from('olt_history')
      .select('id, action, user_email, created_at', { count: 'exact' })
      .eq('olt_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + page_size - 1)

    if (error) throw error

    ok(res, { items: data ?? [], total: count ?? 0, page, page_size })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
