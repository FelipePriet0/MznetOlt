import { apiFetch } from './client'

export type OnuItem = {
  id:                number
  serial_number:     string
  status:            string
  admin_state:       string
  last_known_signal: number | null
  last_seen_at:      string | null
  olt_id:            number
  olt_name:          string
  board_id:          number
  board_name:        string
  pon_port_id:       number
  pon_port_name:     string
  onu_type_id:       number | null
  onu_vendor:        string | null
  onu_model:         string | null
  created_at:        string
}

export type OnuListResponse = {
  items:     OnuItem[]
  total:     number
  page:      number
  page_size: number
}

export type OnuDetail = {
  id:                number
  serial_number:     string
  status:            string
  admin_state:       string
  last_known_signal: number | null
  last_seen_at:      string | null
  olt_id:            number
  olt_name:          string
  board_id:          number
  board_name:        string
  board_slot_index:  number
  pon_port_id:       number
  pon_port_name:     string
  pon_index:         number
  onu_type_id:       number | null
  onu_vendor:        string | null
  onu_model:         string | null
  created_at:        string
  updated_at:        string
}

export type OnuListFilters = {
  olt_id?:       number
  board_id?:     number
  pon_port_id?:  number
  status?:       string
  admin_state?:  string
  serial_number?: string
  page?:         number
  page_size?:    number
}

export type OnuStatus = {
  id: number
  status: string
  admin_state: string
  last_seen_at: string | null
}

export type OnuSignalHistory = {
  items: { time: string; rx: number; tx: number | null }[]
}

export type OnuTrafficHistory = {
  items: { time: string; upload: number; download: number }[]
}

export const onuApi = {
  list: (filters: OnuListFilters = {}) => {
    const q = new URLSearchParams()
    if (filters.olt_id)        q.set('olt_id',        String(filters.olt_id))
    if (filters.board_id)      q.set('board_id',      String(filters.board_id))
    if (filters.pon_port_id)   q.set('pon_port_id',   String(filters.pon_port_id))
    if (filters.status)        q.set('status',        filters.status)
    if (filters.admin_state)   q.set('admin_state',   filters.admin_state)
    if (filters.serial_number) q.set('serial_number', filters.serial_number)
    if (filters.page)          q.set('page',          String(filters.page))
    if (filters.page_size)     q.set('page_size',     String(filters.page_size))
    const qs = q.toString()
    return apiFetch<OnuListResponse>(`/api/onu${qs ? `?${qs}` : ''}`)
  },

  detail: (id: number) =>
    apiFetch<OnuDetail>(`/api/onu/${id}`),

  status: (id: number) =>
    apiFetch<OnuStatus>(`/api/onu/${id}/status`),

  signal: (id: number, limit?: number) => {
    const qs = limit ? `?limit=${limit}` : ''
    return apiFetch<OnuSignalHistory>(`/api/onu/${id}/signal${qs}`)
  },

  traffic: (id: number, limit?: number) => {
    const qs = limit ? `?limit=${limit}` : ''
    return apiFetch<OnuTrafficHistory>(`/api/onu/${id}/traffic${qs}`)
  },

  resync: (id: number) =>
    apiFetch<{ accepted: true; event_id: number | null }>(`/api/onu/resync`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),

  disable: (id: number) =>
    apiFetch<{ accepted: true; event_id: number | null }>(`/api/onu/disable`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),
}
