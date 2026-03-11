export type ListOdbsInput = {}

export type OdbItem = {
  id: number
  location_id: number
  name: string
  address: string
  reference: string
  created_at: string
  updated_at: string
}

export type ListOdbsOutput = {
  items: OdbItem[]
}

