import { apiFetch } from './client'

export type OltItem = {
  id:            number
  name:          string
  vendor:        string
  mgmt_ip:       string
  location_id:   number | null
  location_name: string | null
  zone_id:       number | null
  zone_name:     string | null
  created_at:    string
  updated_at:    string
}

export type OltListResponse = {
  items:     OltItem[]
  total:     number
  page:      number
  page_size: number
}

export type OltDetail = {
  id:            number
  name:          string
  vendor:        string
  mgmt_ip:       string
  location_id:   number | null
  location_name: string | null
  zone_id:       number | null
  zone_name:     string | null
  created_at:    string
  updated_at:    string
}

export type OltHealth = {
  cpu_usage:    number
  memory_usage: number
  temperature:  number
  fan_status:   string
  collected_at: string
} | null

export type OltHealthResponse = {
  item: OltHealth
}

export type CreateOltInput = {
  name:        string
  vendor:      string
  mgmt_ip:     string
  location_id: number
  zone_id:     number
}

export type OltListFilters = {
  vendor?:      string
  location_id?: number
  zone_id?:     number
  search?:      string
  page?:        number
  page_size?:   number
}

export const oltApi = {
  list: (filters: OltListFilters = {}) => {
    const q = new URLSearchParams()
    if (filters.vendor)      q.set('vendor',      filters.vendor)
    if (filters.location_id) q.set('location_id', String(filters.location_id))
    if (filters.zone_id)     q.set('zone_id',     String(filters.zone_id))
    if (filters.search)      q.set('search',      filters.search)
    if (filters.page)        q.set('page',        String(filters.page))
    if (filters.page_size)   q.set('page_size',   String(filters.page_size))
    const qs = q.toString()
    return apiFetch<OltListResponse>(`/api/olt${qs ? `?${qs}` : ''}`)
  },

  detail: (id: number) =>
    apiFetch<OltDetail>(`/api/olt/${id}`),

  health: (id: number) =>
    apiFetch<OltHealthResponse>(`/api/olt/${id}/health`),

  create: (data: CreateOltInput) =>
    apiFetch<OltDetail>('/api/olt', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),
}
