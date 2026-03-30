export type AuthorizationPresetItem = {
  id: number
  name: string
  description: string | null
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ListAuthorizationPresetsInput = {
  is_active?: boolean
  is_default?: boolean
  search?: string
  page?: number
  page_size?: number
}

export type ListAuthorizationPresetsOutput = {
  items: AuthorizationPresetItem[]
  total: number
  page: number
  page_size: number
}

export type AuthorizationPresetRow = {
  id: number
  name: string
  description: string | null
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

