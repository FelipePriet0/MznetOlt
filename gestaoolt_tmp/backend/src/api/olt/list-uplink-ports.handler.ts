import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function listUplinkPortsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')

  try {
    const { data, error } = await supabase
      .from('uplink_ports')
      .select('id, name, fiber, admin_state, status, negotiation, mtu, duplex, pvid, vlan_mode, tagged_vlans, description, updated_at')
      .eq('olt_id', id)
      .order('name', { ascending: true })

    if (error) throw error
    ok(res, { items: data ?? [] })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
