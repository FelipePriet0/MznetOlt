import { supabase } from '@/shared/lib/supabase'
import type { UpdateOnuInput } from './types'

const ALLOWED_KEYS = new Set([
  'olt_id','board_id','pon_port_id','onu_index',
  'serial_number','onu_type_id','external_id',
  'pon_type','mode','vlan_id','tr069_enabled','voip_enabled','catv_enabled','mgmt_ip',
  'odb_id','odb_splitter','download_profile','upload_profile','profile',
  'name','address','contact','latitude','longitude','zone_id','odb_port','tr069_profile','service_port_id',
])

export async function updateOnuService(input: UpdateOnuInput): Promise<boolean> {
  const { id, patch } = input
  if (!id || typeof id !== 'number' || !Number.isFinite(id)) {
    throw new Error('Invalid id')
  }
  const filtered: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(patch ?? {})) {
    if (ALLOWED_KEYS.has(k)) filtered[k] = v
  }
  if (Object.keys(filtered).length === 0) return true

  const { error } = await supabase.from('onus').update(filtered).eq('id', id)
  if (error) throw error
  return true
}
