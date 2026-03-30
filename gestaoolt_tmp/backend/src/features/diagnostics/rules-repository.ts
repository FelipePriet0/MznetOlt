import { supabase } from '@/shared/lib/supabase'
import type { DiagnosticRule } from './types'

export async function loadEnabledRules(): Promise<DiagnosticRule[]> {
  const { data, error } = await supabase
    .from('diagnostic_rules')
    .select('id, detector_type, enabled, config')
    .eq('enabled', true)

  if (error) throw error
  return (data ?? []) as DiagnosticRule[]
}
