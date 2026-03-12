import { apiFetch } from './client'

export type ZoneItem = {
  id:         number
  name:       string
  created_at: string
}

export type OnuTypeItem = {
  id:         number
  name:       string
  vendor:     string
  created_at: string
}

export type SpeedProfileItem = {
  id:            number
  name:          string
  download_mbps: number
  upload_mbps:   number
  created_at:    string
}

export type ZonesResponse         = { items: ZoneItem[]         }
export type OnuTypesResponse      = { items: OnuTypeItem[]      }
export type SpeedProfilesResponse = { items: SpeedProfileItem[] }

export const settingsApi = {
  zones:         () => apiFetch<ZonesResponse>('/api/settings/zones'),
  onuTypes:      () => apiFetch<OnuTypesResponse>('/api/settings/onu-types'),
  speedProfiles: () => apiFetch<SpeedProfilesResponse>('/api/settings/speed-profiles'),
}
