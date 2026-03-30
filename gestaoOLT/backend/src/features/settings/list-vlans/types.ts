export type ListVlansInput = {}

export type VlanItem = {
  id: number
  vlan_id: number
  description: string
  created_at: string
}

export type ListVlansOutput = {
  items: VlanItem[]
}

