import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function createVlanHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const body = req.body as { vlan_id?: unknown; description?: unknown }
  const vlan_id = Number(body?.vlan_id)
  if (!vlan_id || isNaN(vlan_id) || vlan_id < 1 || vlan_id > 4094)
    return badRequest(res, 'vlan_id must be a number between 1 and 4094')

  try {
    const { data, error } = await supabase
      .from('vlans')
      .insert({ vlan_id, description: body?.description ?? null })
      .select('id, vlan_id, description, created_at')
      .single()

    if (error) throw error
    ok(res, data)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
