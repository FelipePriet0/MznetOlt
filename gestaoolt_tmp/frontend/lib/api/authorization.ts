import { apiFetch } from './client'

export type AuthorizationPreset = {
  id:          number
  name:        string
  description: string | null
  is_default:  boolean
  is_active:   boolean
  created_at:  string
  updated_at:  string
}

export type AuthorizationPresetsResponse = {
  items:     AuthorizationPreset[]
  total:     number
  page:      number
  page_size: number
}

export type AuthorizationPresetsFilters = {
  is_active?:  boolean
  is_default?: boolean
  search?:     string
  page?:       number
  page_size?:  number
}

export type AuthorizeOnuInput = {
  onu_id:    number
  preset_id?: number
}

export type AuthorizeOnuResponse = {
  success:  boolean
  event_id: number | null
}

export const authorizationApi = {
  listPresets: (filters: AuthorizationPresetsFilters = {}) => {
    const q = new URLSearchParams()
    if (filters.is_active  !== undefined) q.set('is_active',  String(filters.is_active))
    if (filters.is_default !== undefined) q.set('is_default', String(filters.is_default))
    if (filters.search)    q.set('search',    filters.search)
    if (filters.page)      q.set('page',      String(filters.page))
    if (filters.page_size) {
      const size = Math.min(Math.max(filters.page_size, 1), 100)
      q.set('page_size', String(size))
    }
    const qs = q.toString()
    return apiFetch<AuthorizationPresetsResponse>(
      `/api/authorization/presets${qs ? `?${qs}` : ''}`
    )
  },

  getDefault: () =>
    apiFetch<AuthorizationPreset>('/api/authorization/presets/default'),

  authorize: (data: AuthorizeOnuInput) =>
    apiFetch<AuthorizeOnuResponse>('/api/authorization/authorize', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),
}
