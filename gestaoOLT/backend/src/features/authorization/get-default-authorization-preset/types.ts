export type AuthorizationPresetItem = {
  id: number
  name: string
  description: string | null
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type GetDefaultAuthorizationPresetInput = {}

export type GetDefaultAuthorizationPresetOutput = {
  item: AuthorizationPresetItem
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

