import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function createZoneHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const body = req.body as { name?: unknown }
  const name = String(body?.name ?? '').trim()
  if (!name) return badRequest(res, 'name is required')

  try {
    const { data, error } = await supabase
      .from('zones')
      .insert({ name })
      .select('id, name, created_at')
      .single()

    if (error) throw error
    ok(res, data)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
