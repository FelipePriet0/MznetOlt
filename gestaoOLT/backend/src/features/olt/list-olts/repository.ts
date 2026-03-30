import { supabase } from '@/shared/lib/supabase'
import type { ListOltsInput, OltItem, OltRow } from './types'

export async function listOltsRepository(
  input: Required<Pick<ListOltsInput, 'page' | 'page_size'>> & Omit<ListOltsInput, 'page' | 'page_size'>
): Promise<{ data: OltItem[]; total: number }> {
  const { vendor, location_id, zone_id, search, page, page_size } = input

  const from = (page - 1) * page_size
  const to = from + page_size - 1

  let query = supabase
    .from('olts')
    .select('id, name, vendor, mgmt_ip, location_id, zone_id, created_at, updated_at, locations(name), zones(name)', { count: 'exact' })
    .order('id', { ascending: true })
    .range(from, to)

  if (vendor !== undefined) {
    query = query.eq('vendor', vendor)
  }

  if (location_id !== undefined) {
    query = query.eq('location_id', location_id)
  }

  if (zone_id !== undefined) {
    query = query.eq('zone_id', zone_id)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,mgmt_ip.ilike.%${search}%`)
  }

  const { data, count, error } = await query

  if (error) throw error

  const items = (data as unknown as OltRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    vendor: row.vendor,
    mgmt_ip: row.mgmt_ip,
    location_id: row.location_id,
    location_name: row.locations?.name ?? null,
    zone_id: row.zone_id,
    zone_name: row.zones?.name ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))

  return { data: items, total: count ?? 0 }
}
