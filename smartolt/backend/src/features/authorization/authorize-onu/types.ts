export type AuthorizeOnuInput = {
  onu_id: number
  preset_id?: number
}

export type AuthorizeOnuOutput = {
  success: boolean
  event_id: number | null
}

export type OnuRow = {
  id: number
  serial_number: string
  olt_id: number
  board_id: number
  pon_port_id: number
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

export type AuthorizationPresetProfileRow = {
  id: number
  authorization_preset_id: number
  onu_type_id: number | null
  service_vlan: string | null
  line_profile: string | null
  service_profile: string | null
  native_vlan: string | null
  pppoe_enabled: boolean
  created_at: string
  updated_at: string
}
