import { apiFetch } from './client'

export type TicketItem = {
  id: number
  onu_id: number
  onu_serial: string
  olt_id: number
  olt_name: string
  detector_type: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_field' | 'resolved' | 'closed' | 'false_positive'
  title: string
  diagnosis: string | null
  opened_at: string
  resolved_at: string | null
}

export type TicketFilters = {
  status?: string
  urgency?: string
  olt_id?: number
  page?: number
  page_size?: number
}

export const diagnosticsApi = {
  listTickets(filters: TicketFilters = {}): Promise<{ items: TicketItem[]; total: number; page: number; page_size: number }> {
    const params = new URLSearchParams()
    if (filters.status)   params.set('status',    filters.status)
    if (filters.urgency)  params.set('urgency',   filters.urgency)
    if (filters.olt_id)   params.set('olt_id',    String(filters.olt_id))
    if (filters.page)     params.set('page',      String(filters.page))
    if (filters.page_size) params.set('page_size', String(filters.page_size))
    const qs = params.toString()
    return apiFetch(`/api/tickets${qs ? `?${qs}` : ''}`)
  },
}
