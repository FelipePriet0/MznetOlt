import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest, notFound } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function updateZoneHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')

  const body = req.body as { name?: unknown }
  const name = String(body?.name ?? '').trim()
  if (!name) return badRequest(res, 'name is required')

  try {
    const { data, error } = await supabase
      .from('zones')
      .update({ name })
      .eq('id', id)
      .select('id, name, created_at')
      .maybeSingle()

    if (error) throw error
    if (!data) return notFound(res, 'Zone not found')
    ok(res, data)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

