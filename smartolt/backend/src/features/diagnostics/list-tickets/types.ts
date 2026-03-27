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

export type ListTicketsInput = {
  status?: string
  urgency?: string
  olt_id?: number
  page: number
  page_size: number
}

export type ListTicketsOutput = {
  items: TicketItem[]
  total: number
  page: number
  page_size: number
}
