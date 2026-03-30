import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function updatePonPortHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const portId = Number(req.params.portId)
  if (!portId) { badRequest(res, 'portId inválido'); return }

  const body = req.body as Record<string, unknown>
  const patch: Record<string, unknown> = {}

  if (body.admin_state !== undefined) patch.admin_state = body.admin_state
  if (body.description !== undefined) patch.description = body.description
  if (body.min_range_meters !== undefined) patch.min_range_meters = Number(body.min_range_meters)
  if (body.max_range_meters !== undefined) patch.max_range_meters = Number(body.max_range_meters)

  if (!Object.keys(patch).length) { badRequest(res, 'Nenhum campo para atualizar'); return }

  patch.updated_at = new Date().toISOString()

  try {
    const { error } = await supabase.from('pon_ports').update(patch).eq('id', portId)
    if (error) throw error
    ok(res, { updated: true })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
