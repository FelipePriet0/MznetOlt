import { supabase } from '@/shared/lib/supabase'
import type {
  UplinkErrorsSeriesInput,
  UplinkErrorsSeriesItem,
  UplinkErrorsSeriesOutput,
} from './types'

type UplinkSampleRow = {
  collected_at: string
  errors: number | null
}

export async function getUplinkErrorsSeries(
  input: UplinkErrorsSeriesInput
): Promise<UplinkErrorsSeriesOutput> {
  const { data, error } = await supabase
    .from('uplink_samples')
    .select('collected_at, errors')
    .eq('olt_id', input.olt_id)
    .order('collected_at', { ascending: true })

  if (error) {
    throw error
  }

  const rows = (data ?? []) as UplinkSampleRow[]

  const items: UplinkErrorsSeriesItem[] = rows.map((row) => ({
    collected_at: row.collected_at,
    errors: row.errors ?? 0,
  }))

  return { items }
}

