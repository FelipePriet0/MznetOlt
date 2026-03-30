import { supabase } from '@/shared/lib/supabase'
import type { ListTicketsInput, TicketItem } from './types'

export async function listTicketsRepository(
  input: ListTicketsInput
): Promise<{ data: TicketItem[]; total: number }> {
  const { status, urgency, olt_id, page, page_size } = input
  const from = (page - 1) * page_size
  const to = from + page_size - 1

  let query = supabase
    .from('diagnostic_tickets')
    .select(
      'id, onu_id, olt_id, detector_type, urgency, status, title, diagnosis, opened_at, resolved_at, onus(serial_number), olts(name)',
      { count: 'exact' }
    )
    .order('opened_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (urgency) query = query.eq('urgency', urgency)
  if (olt_id) query = query.eq('olt_id', olt_id)

  const { data, count, error } = await query
  if (error) throw error

  const items = ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    onu_id: row.onu_id,
    onu_serial: row.onus?.serial_number ?? '—',
    olt_id: row.olt_id,
    olt_name: row.olts?.name ?? '—',
    detector_type: row.detector_type,
    urgency: row.urgency,
    status: row.status,
    title: row.title,
    diagnosis: row.diagnosis,
    opened_at: row.opened_at,
    resolved_at: row.resolved_at,
  }))

  return { data: items, total: count ?? 0 }
}
