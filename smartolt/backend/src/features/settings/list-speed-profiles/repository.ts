import { supabase } from '@/shared/lib/supabase'
import type { SpeedProfileItem } from './types'

export async function listSpeedProfilesRepository(): Promise<SpeedProfileItem[]> {
  const { data, error } = await supabase
    .from('speed_profiles')
    .select('id, name, download_mbps, upload_mbps, created_at')
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as SpeedProfileItem[]
}

