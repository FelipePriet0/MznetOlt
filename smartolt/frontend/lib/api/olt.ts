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

export type BoardItem = {
  id:             number
  name:           string
  slot_index:     number
  board_type:     string | null
  board_hw_id:    string | null
  board_status:   string
  board_role:     string
  terminal_count: number | null
  pon_port_count: number
  created_at:     string
  updated_at:     string
}
export type PonPortItem = { id: number; name: string; pon_index: number }
export type BoardsResponse = { items: BoardItem[] }
export type PonPortsResponse = { items: PonPortItem[] }

export type OltDetail = {
  id:               number
  name:             string
  vendor:           string
  mgmt_ip:          string
  location_id:      number | null
  location_name:    string | null
  zone_id:          number | null
  zone_name:        string | null
  tcp_port:         number
  telnet_user:      string | null
  telnet_password:  string | null
  snmp_ro_community:string | null
  snmp_rw_community:string | null
  snmp_udp_port:    number
  iptv_enabled:        boolean
  hw_version:          string | null
  pon_type:            'GPON' | 'EPON' | 'GPON+EPON'
  auto_backup_enabled:       boolean
  show_disabled_onus:        boolean
  onu_description_format:    string
  use_dhcp_option82:         boolean
  dhcp_option82_field:       string | null
  use_dhcp_option82_mgmt:    boolean
  dhcp_option82_mgmt_field:  string | null
  use_pppoe_plus:            boolean
  onu_ip_source_guard:       boolean
  use_max_mac_learn:         boolean
  max_mac_per_onu:           number
  use_mac_allowlist:         boolean
  use_mac_denylist:          boolean
  use_port_acl:              boolean
  port_acl_field:            string | null
  rx_warning_dbm:            number
  rx_critical_dbm:           number
  separate_voip_mgmt_hosts:  boolean
  temp_warning_celsius:      number
  temp_critical_celsius:     number
  tag_transform_mode:        string
  use_cvlan_id:              boolean
  use_svlan_id:              boolean
  created_at:                string
  updated_at:                string
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
  name:              string
  vendor:            string
  mgmt_ip:           string
  location_id?:      number | null
  zone_id?:          number | null
  tcp_port?:         number
  telnet_user?:      string
  telnet_password?:  string
  snmp_ro_community?:string
  snmp_rw_community?:string
  snmp_udp_port?:    number
  iptv_enabled?:     boolean
  hw_version?:       string
  pon_type?:         'GPON' | 'EPON' | 'GPON+EPON'
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

  boards: (oltId: number) =>
    apiFetch<BoardsResponse>(`/api/olt/${oltId}/boards`),

  allBoards: () =>
    apiFetch<BoardsResponse>(`/api/boards`),

  ponPorts: (boardId: number) =>
    apiFetch<PonPortsResponse>(`/api/boards/${boardId}/pon-ports`),

  allPonPorts: () =>
    apiFetch<PonPortsResponse>(`/api/pon-ports`),

  update: (id: number, patch: Partial<Omit<OltDetail, 'id' | 'created_at' | 'updated_at' | 'location_name' | 'zone_name'>>) =>
    apiFetch<{ updated: boolean }>(`/api/olt/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  delete: (id: number) =>
    apiFetch<{ deleted: boolean }>(`/api/olt/${id}`, { method: 'DELETE' }),

  history: (id: number, page = 1, page_size = 50) =>
    apiFetch<{ items: OltHistoryItem[]; total: number; page: number; page_size: number }>(
      `/api/olt/${id}/history?page=${page}&page_size=${page_size}`
    ),

  backups: (id: number, page = 1, page_size = 50) =>
    apiFetch<{ items: OltBackupItem[]; total: number; page: number; page_size: number }>(
      `/api/olt/${id}/backups?page=${page}&page_size=${page_size}`
    ),

  triggerBackup: (id: number) =>
    apiFetch<OltBackupItem>(`/api/olt/${id}/backups`, { method: 'POST' }),

  deleteBackup: (oltId: number, backupId: number) =>
    apiFetch<{ deleted: boolean }>(`/api/olt/${oltId}/backups/${backupId}`, { method: 'DELETE' }),

  uplinkPorts: (id: number) =>
    apiFetch<{ items: UplinkPortItem[] }>(`/api/olt/${id}/uplink-ports`),

  updateUplinkPort: (oltId: number, portId: number, patch: Partial<UplinkPortItem>) =>
    apiFetch<{ updated: boolean }>(`/api/olt/${oltId}/uplink-ports/${portId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
}

export type OltHistoryItem = {
  id:         number
  action:     string
  user_email: string | null
  created_at: string
}

export type UplinkPortItem = {
  id:          number
  name:        string
  fiber:       string | null
  admin_state: string
  status:      string
  negotiation: string
  mtu:         number | null
  duplex:      string
  pvid:        number
  vlan_mode:   string
  tagged_vlans:string | null
  description: string | null
  updated_at:  string
}

export type OltBackupItem = {
  id:             number
  status:         'success' | 'error'
  size_kb:        number | null
  next_backup_at: string | null
  notes:          string | null
  backup_type:    string
  line_count:     number | null
  created_at:     string
}
