import { supabase } from '@/shared/lib/supabase'
import type { VlanItem } from './types'

export async function listVlansRepository(): Promise<VlanItem[]> {
  const { data, error } = await supabase
    .from('vlans')
    .select('id, vlan_id, description, created_at')
    .order('vlan_id', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as VlanItem[]
}

