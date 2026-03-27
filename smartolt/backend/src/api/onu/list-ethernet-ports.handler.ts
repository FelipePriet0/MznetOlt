import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '../../shared/lib/supabase'

export async function listEthernetPortsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')
  try {
    const { data, error } = await supabase
      .from('ethernet_ports')
      .select('id, port_name, admin_state, mode, vlan_id, dhcp_mode')
      .eq('onu_id', id)
      .order('port_name', { ascending: true })
    if (error) throw error
    ok(res, { items: data ?? [] })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

