import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '../../shared/lib/supabase'

export async function updateEthernetPortHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  const portId = Number(req.params.portId)
  if (!id || isNaN(id) || !portId || isNaN(portId)) return badRequest(res, 'invalid ids')
  const patch = (req.body ?? {}) as Record<string, unknown>
  const allowed = ['admin_state','mode','vlan_id','dhcp_mode']
  const filtered: Record<string, unknown> = {}
  for (const k of allowed) if (k in patch) filtered[k] = patch[k]
  try {
    const { error } = await supabase.from('ethernet_ports').update(filtered).eq('id', portId).eq('onu_id', id)
    if (error) throw error
    ok(res, { updated: true })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

