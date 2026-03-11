import { supabase } from '@/shared/lib/supabase'
import type { ExportItem } from './types'

export async function listExportsRepository(): Promise<ExportItem[]> {
  const { data, error } = await supabase
    .from('data_exports')
    .select('id, export_type, status, file_url, created_at, finished_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as ExportItem[]
}

