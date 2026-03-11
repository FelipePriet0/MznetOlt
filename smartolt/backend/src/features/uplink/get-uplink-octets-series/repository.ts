import { supabase } from '@/shared/lib/supabase'
import type {
  UplinkOctetsSeriesInput,
  UplinkOctetsSeriesItem,
  UplinkOctetsSeriesOutput,
} from './types'

type UplinkSampleRow = {
  collected_at: string
  octets: number | null
}

export async function getUplinkOctetsSeries(
  input: UplinkOctetsSeriesInput
): Promise<UplinkOctetsSeriesOutput> {
  const { data, error } = await supabase
    .from('uplink_samples')
    .select('collected_at, octets')
    .eq('olt_id', input.olt_id)
    .order('collected_at', { ascending: true })

  if (error) {
    throw error
  }

  const rows = (data ?? []) as UplinkSampleRow[]

  const items: UplinkOctetsSeriesItem[] = rows.map((row) => ({
    collected_at: row.collected_at,
    octets: row.octets ?? 0,
  }))

  return { items }
}

