import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function updateUplinkPortHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const oltId  = Number(req.params.id)
  const portId = Number(req.params.portId)
  if (!oltId || isNaN(oltId) || !portId || isNaN(portId)) return badRequest(res, 'invalid ids')

  const body    = (req.body ?? {}) as Record<string, unknown>
  const allowed = ['vlan_mode', 'tagged_vlans', 'description', 'pvid', 'mtu', 'duplex', 'negotiation', 'admin_state']
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of allowed) if (k in body) patch[k] = body[k]

  try {
    const { error } = await supabase
      .from('uplink_ports')
      .update(patch)
      .eq('id', portId)
      .eq('olt_id', oltId)

    if (error) throw error
    ok(res, { updated: true })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
