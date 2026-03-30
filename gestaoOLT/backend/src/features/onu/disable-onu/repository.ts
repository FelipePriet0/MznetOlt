import { supabase } from '@/shared/lib/supabase'
import type { DisableOnuOutput } from './types'

export async function disableOnuRepository(id: number): Promise<DisableOnuOutput> {
  const { data: onu, error: onuErr } = await supabase
    .from('onus')
    .select('id, olt_id, serial_number')
    .eq('id', id)
    .maybeSingle()

  if (onuErr) throw onuErr
  if (!onu) {
    const e = new Error('ONU not found')
    ;(e as any).statusCode = 404
    throw e
  }

  const { data: ev, error: evErr } = await supabase
    .from('network_events')
    .insert({
      olt_id: onu.olt_id,
      onu_id: onu.id,
      onu_serial: onu.serial_number,
      event_type: 'onu_disable_request',
      previous_state: null,
      current_state: null,
      payload: { source: 'ui' },
    })
    .select('id')
    .single()

  if (evErr) throw evErr

  return { accepted: true, event_id: ev?.id ?? null }
}

