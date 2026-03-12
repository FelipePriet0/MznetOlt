import { supabase } from '@/shared/lib/supabase'
import type { OnuStatusOutput } from './types'

export async function getOnuStatusRepository(id: number): Promise<OnuStatusOutput | null> {
  const { data, error } = await supabase
    .from('onus')
    .select('id, status, admin_state, last_seen_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return data as unknown as OnuStatusOutput
}

