import { supabase } from '@/shared/lib/supabase'
import type { AuthorizationItem } from './types'

export async function listAuthorizationsRepository(): Promise<AuthorizationItem[]> {
  const { data, error } = await supabase
    .from('onu_authorizations')
    .select('id, onu_id, status, created_at, payload_json')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as AuthorizationItem[]
}

