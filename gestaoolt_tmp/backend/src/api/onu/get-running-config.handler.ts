import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function getOnuRunningConfigHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')

  try {
    const { data, error } = await supabase
      .from('onus')
      .select('id, serial_number, onu_index, vlan_id, service_port_id, download_profile, upload_profile, name, address, boards(name), pon_ports(name), olts(name)')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) return badRequest(res, 'ONU not found')

    const row = data as any
    const boardSlot = row.boards?.name ?? '?'
    const ponPort   = row.pon_ports?.name ?? '?'
    const desc      = [row.name, row.address].filter(Boolean).join('_').replace(/\s+/g, '_').slice(0, 64)

    const lines: string[] = []
    lines.push(`interface gpon ${boardSlot}`)
    lines.push(` ont add ${ponPort} ${row.onu_index ?? '?'} sn-auth "${row.serial_number}" omci ont-lineprofile-id 1 ont-srvprofile-id 1${desc ? ` desc "${desc}"` : ''}`)
    if (row.vlan_id) {
      lines.push(` port ont native-vlan ${ponPort} ${row.onu_index ?? '?'} eth 1 vlan ${row.vlan_id} priority 0`)
    }
    lines.push('quit')
    if (row.service_port_id && row.vlan_id) {
      lines.push(`service-port ${row.service_port_id} vlan ${row.vlan_id} gpon ${boardSlot}/${ponPort} ont ${row.onu_index ?? '?'} gemport 1 multi-service user-vlan ${row.vlan_id} tag-transform translate${row.download_profile ? ` inbound traffic-table index 8` : ''}${row.upload_profile ? ` outbound traffic-table index 9` : ''}`)
    }

    ok(res, { text: lines.join('\n') })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
