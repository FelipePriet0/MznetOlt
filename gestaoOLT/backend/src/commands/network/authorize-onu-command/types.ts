import type { AuthorizeOnuDriverResult } from '../../../drivers/olt/base-driver'

export type AuthorizationProfileInput = {
  line_profile?: string | null
  service_profile?: string | null
  service_vlan?: number | null
  native_vlan?: number | null
}

export type AuthorizeOnuNetworkCommandInput = {
  onu_serial: string
  olt_id: string
  board_index: number
  pon_index: number
  authorization_profiles: AuthorizationProfileInput[]
}

export type AuthorizeOnuNetworkCommandOutput = AuthorizeOnuDriverResult