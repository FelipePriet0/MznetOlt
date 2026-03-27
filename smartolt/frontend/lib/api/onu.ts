import { apiFetch } from './client'

export type OnuItem = {
  id:                number
  serial_number:     string
  name:              string | null
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
  zone_name?:        string | null
  onu_index?:        number | null
  mode?:             string | null
  vlan_id?:          number | null
  tr069_enabled?:    boolean | null
  catv_enabled?:     boolean | null
  voip_enabled?:     boolean | null
  odb_splitter?:     string | null
  odb_name?:         string | null
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
  onu_index?:        number | null
  onu_type_id:       number | null
  onu_vendor:        string | null
  onu_model:         string | null
  name?:             string | null
  address?:          string | null
  contact?:          string | null
  external_id?:      string | null
  latitude?:         number | null
  longitude?:        number | null
  pon_type?:         string | null
  mode?:             string | null
  vlan_id?:          number | null
  tr069_enabled?:    boolean | null
  voip_enabled?:     boolean | null
  catv_enabled?:     boolean | null
  mgmt_ip?:          string | null
  odb_id?:           number | null
  odb_name?:         string | null
  zone_id?:          number | null
  zone_name?:        string | null
  odb_port?:         string | null
  tr069_profile?:    string | null
  service_port_id?:  number | null
  download_profile?: string | null
  upload_profile?:   string | null
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
  search?:       string
  zone_id?:      number
  onu_type_id?:  number
  // Multi-select
  olt_ids?:      number[]
  board_ids?:    number[]
  pon_port_ids?: number[]
  zone_ids?:     number[]
  onu_type_ids?: number[]
  status_in?:    string[]
  admin_state_in?: string[]
  signal_levels?: ('good'|'warning'|'critical')[]
  page?:         number
  page_size?:    number
}

export type OnuStatus = {
  id: number
  status: string
  admin_state: string
  last_seen_at: string | null
  // Óptico
  rx_dbm: number | null
  tx_dbm: number | null
  signal_ts: string | null
  // Cadastro
  serial_number: string | null
  name: string | null
  mgmt_ip: string | null
  tr069_enabled: boolean | null
  catv_enabled: boolean | null
  voip_enabled: boolean | null
  mode: string | null
  vlan_id: number | null
  download_profile: string | null
  upload_profile: string | null
  service_port_id: number | null
  created_at: string
  onu_index: number | null
}

export type OnuSoftwareInfo = {
  vendor: string | null
  model: string | null
  firmware: string | null
  serial_number: string | null
  onu_type_id: number | null
}

export type TrafficSample = {
  collected_at: string
  rx_mbps: number | null
  tx_mbps: number | null
}

export type OnuTrafficData = {
  items: TrafficSample[]
  stats: {
    rx_max: number | null
    tx_max: number | null
    rx_avg: number | null
    tx_avg: number | null
  }
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
    if (filters.search)        q.set('search',        filters.search)
    if (filters.zone_id)       q.set('zone_id',       String(filters.zone_id))
    if (filters.onu_type_id)   q.set('onu_type_id',   String(filters.onu_type_id))
    if (filters.olt_ids?.length)      q.set('olt_ids',      filters.olt_ids.join(','))
    if (filters.board_ids?.length)    q.set('board_ids',    filters.board_ids.join(','))
    if (filters.pon_port_ids?.length) q.set('pon_port_ids', filters.pon_port_ids.join(','))
    if (filters.zone_ids?.length)     q.set('zone_ids',     filters.zone_ids.join(','))
    if (filters.onu_type_ids?.length) q.set('onu_type_ids', filters.onu_type_ids.join(','))
    if (filters.status_in?.length)      q.set('status_in',      filters.status_in.join(','))
    if (filters.admin_state_in?.length) q.set('admin_state_in', filters.admin_state_in.join(','))
    if (filters.signal_levels?.length)  q.set('signal_levels',  filters.signal_levels.join(','))
    if (filters.page)          q.set('page',          String(filters.page))
    if (filters.page_size)     q.set('page_size',     String(filters.page_size))
    const qs = q.toString()
    return apiFetch<OnuListResponse>(`/api/onu${qs ? `?${qs}` : ''}`)
  },

  detail: (id: number) =>
    apiFetch<OnuDetail>(`/api/onu/${id}`),

  status: (id: number) =>
    apiFetch<OnuStatus>(`/api/onu/${id}/status`),
  runningConfig: (id: number) =>
    apiFetch<{ text: string }>(`/api/onu/${id}/running-config`),
  softwareInfo: (id: number) =>
    apiFetch<OnuSoftwareInfo>(`/api/onu/${id}/software-info`),

  traffic: (id: number, limit = 60) =>
    apiFetch<OnuTrafficData>(`/api/onu/${id}/traffic?limit=${limit}`),
  signalHistory: (id: number, opts?: { limit?: number; period?: 'day'|'week'|'month'|'year' }) => {
    const q = new URLSearchParams()
    if (opts?.limit) q.set('limit', String(opts.limit))
    if (opts?.period) q.set('period', opts.period)
    const qs = q.toString()
    return apiFetch<{ items: { ts: string; value: number }[] }>(`/api/onu/${id}/signal-history${qs ? `?${qs}` : ''}`)
  },
  ethernetPorts: (id: number) =>
    apiFetch<{ items: { id: number; port_name: string; admin_state: string; mode: string; vlan_id: number | null; dhcp_mode: string | null }[] }>(`/api/onu/${id}/ethernet-ports`),
  updateEthernetPort: (id: number, portId: number, patch: Partial<{ admin_state: string; mode: string; vlan_id: number | null; dhcp_mode: string | null }>) =>
    apiFetch<{ updated: boolean }>(`/api/onu/${id}/ethernet-ports/${portId}`, { method: 'PATCH', body: JSON.stringify(patch) }),

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

  events: (id: number, limit = 5) =>
    apiFetch<{ items: { id: number; event_type: string; created_at: string }[] }>(`/api/onu/${id}/events?limit=${limit}`),

  update: (id: number, patch: Partial<OnuDetail & OnuItem & {
    external_id?: string | null
    address?: string | null
    contact?: string | null
    latitude?: number | null
    longitude?: number | null
  }>) => apiFetch<{ updated: boolean }>(`/api/onu/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  }),
}
