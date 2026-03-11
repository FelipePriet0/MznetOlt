export type CreateOltInput = {
  name: string
  vendor: string
  mgmt_ip: string
  location_id: number
  zone_id: number
}

export type CreateOltOutput = {
  id: number
  name: string
  vendor: string
  mgmt_ip: string
  location_id: number
  zone_id: number
  created_at: string
  updated_at: string
}
