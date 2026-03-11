export type GetOltDetailsInput = {
  id: number
}

export type GetOltDetailsOutput = {
  id: number
  name: string
  vendor: string
  mgmt_ip: string
  location_id: number | null
  location_name: string | null
  zone_id: number | null
  zone_name: string | null
  created_at: string
  updated_at: string
}

export type OltDetailsRow = {
  id: number
  name: string
  vendor: string
  mgmt_ip: string
  location_id: number | null
  zone_id: number | null
  created_at: string
  updated_at: string
  locations: { name: string } | null
  zones: { name: string } | null
}
