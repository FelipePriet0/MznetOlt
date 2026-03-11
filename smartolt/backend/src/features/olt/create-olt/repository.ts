import { supabase } from '@/shared/lib/supabase'
import type { CreateOltInput, CreateOltOutput } from './types'

export async function createOltRepository(input: CreateOltInput): Promise<CreateOltOutput> {
  const { data, error } = await supabase
    .from('olts')
    .insert({
      name: input.name,
      vendor: input.vendor,
      mgmt_ip: input.mgmt_ip,
      location_id: input.location_id,
      zone_id: input.zone_id,
    })
    .select('id, name, vendor, mgmt_ip, location_id, zone_id, created_at, updated_at')
    .single()

  if (error) throw error

  return data as CreateOltOutput
}
