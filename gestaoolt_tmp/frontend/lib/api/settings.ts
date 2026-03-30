import { apiFetch } from './client'

export type ZoneItem = {
  id:         number
  name:       string
  created_at: string
}

export type ZonesResponse         = { items: ZoneItem[]         }
export type VlanItem = { id: number; vlan_id: number; description: string; created_at: string }
export type VlansResponse = { items: VlanItem[] }

export const settingsApi = {
  zones:       () => apiFetch<ZonesResponse>('/api/settings/zones'),
  createZone:  (name: string) => apiFetch<ZoneItem>('/api/settings/zones', { method: 'POST', body: JSON.stringify({ name }) }),
  updateZone:  (id: number, name: string) => apiFetch<ZoneItem>(`/api/settings/zones/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
  deleteZone:  (id: number) => apiFetch<{ deleted: boolean }>(`/api/settings/zones/${id}`, { method: 'DELETE' }),

  vlans:       () => apiFetch<VlansResponse>('/api/settings/vlans'),
  createVlan:  (vlan_id: number, description?: string) => apiFetch<VlanItem>('/api/settings/vlans', { method: 'POST', body: JSON.stringify({ vlan_id, description }) }),
  deleteVlan:  (id: number) => apiFetch<{ deleted: boolean }>(`/api/settings/vlans/${id}`, { method: 'DELETE' }),
}
