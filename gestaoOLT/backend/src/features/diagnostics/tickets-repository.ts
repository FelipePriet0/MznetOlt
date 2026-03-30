import { supabase } from '@/shared/lib/supabase'
import type { DetectorMatch, DetectorType } from './types'

export async function hasOpenTicket(onu_id: number, detector_type: DetectorType): Promise<boolean> {
  const { data, error } = await supabase
    .from('diagnostic_tickets')
    .select('id')
    .eq('onu_id', onu_id)
    .eq('detector_type', detector_type)
    .in('status', ['open', 'in_field'])
    .maybeSingle()

  if (error) throw error
  return data !== null
}

export async function openTicket(match: DetectorMatch, detector_type: DetectorType): Promise<number> {
  const { data, error } = await supabase
    .from('diagnostic_tickets')
    .insert({
      onu_id: match.onu_id,
      olt_id: match.olt_id,
      detector_type,
      urgency: match.urgency,
      title: match.title,
      facts: match.facts,
      status: 'open',
      opened_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) throw error
  return (data as { id: number }).id
}

export async function updateTicketDiagnosis(ticket_id: number, diagnosis: string): Promise<void> {
  const { error } = await supabase
    .from('diagnostic_tickets')
    .update({ diagnosis, updated_at: new Date().toISOString() })
    .eq('id', ticket_id)

  if (error) throw error
}

export async function logTicketEvent(
  ticket_id: number,
  event_type: string,
  notes?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from('ticket_events').insert({
    ticket_id,
    event_type,
    actor: 'system',
    notes: notes ?? null,
    metadata: metadata ?? null,
  })

  if (error) throw error
}
