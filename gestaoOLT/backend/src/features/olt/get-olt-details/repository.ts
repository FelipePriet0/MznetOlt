import { supabase } from '@/shared/lib/supabase'
import type { OltDetailsRow } from './types'

export async function findOltById(id: number): Promise<OltDetailsRow | null> {
  const { data, error } = await supabase
    .from('olts')
    .select('*, locations(name), zones(name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as unknown as OltDetailsRow
}
