import { apiFetch } from './client'

export type UnconfiguredOnuItem = {
  id: number
  serial_number: string
  olt_id: number
  olt_name: string
  board_id: number
  board_name: string
  pon_port_id: number
  pon_port_name: string
  pon_port_description: string | null
  pon_type: string | null
  onu_vendor?: string | null
  onu_model?: string | null
  status: string
  admin_state: string
  last_known_signal: number | null
  last_seen_at: string | null
  created_at: string
}

export type UnconfiguredListResponse = {
  items: UnconfiguredOnuItem[]
  total: number
  page: number
  page_size: number
}

export type UnconfiguredFilters = {
  olt_id?: number
  board_id?: number
  pon_port_id?: number
  serial_number?: string
  page?: number
  page_size?: number
}

export const unconfiguredApi = {
  list: (filters: UnconfiguredFilters = {}) => {
    const q = new URLSearchParams()
    if (filters.olt_id) q.set('olt_id', String(filters.olt_id))
    if (filters.board_id) q.set('board_id', String(filters.board_id))
    if (filters.pon_port_id) q.set('pon_port_id', String(filters.pon_port_id))
    if (filters.serial_number) q.set('serial_number', filters.serial_number)
    if (filters.page) q.set('page', String(filters.page))
    if (filters.page_size) q.set('page_size', String(filters.page_size))
    const qs = q.toString()
    return apiFetch<UnconfiguredListResponse>(`/api/onu/unconfigured${qs ? `?${qs}` : ''}`)
  },
}

