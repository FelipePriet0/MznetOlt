import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { supabase } from '@/shared/lib/supabase'

export async function getOnuSoftwareInfoHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')

  try {
    // onu_vendor/onu_model were in the onu_types table which was dropped (migration 0018).
    // Only serial_number and onu_type_id are available in the onus row.
    const { data, error } = await supabase
      .from('onus')
      .select('id, serial_number, onu_type_id')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) return badRequest(res, 'ONU not found')

    const row = data as any
    ok(res, {
      // vendor/model require onu_types table (dropped) or OLT CLI — see SmartOLTObsidian/integracao-cli-olt-pendencias.md
      vendor: null,
      model: null,
      firmware: null,
      serial_number: row.serial_number ?? null,
      onu_type_id: row.onu_type_id ?? null,
    })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
