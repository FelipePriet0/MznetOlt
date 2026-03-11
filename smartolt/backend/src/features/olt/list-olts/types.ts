export type OltItem = {
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

export type ListOltsInput = {
  vendor?: string
  location_id?: number
  zone_id?: number
  search?: string
  page?: number
  page_size?: number
}

export type ListOltsOutput = {
  items: OltItem[]
  total: number
  page: number
  page_size: number
}

export type OltRow = {
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
