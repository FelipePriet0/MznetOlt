export type ListZonesInput = {}

export type ZoneItem = {
  id: number
  name: string
  created_at: string
}

export type ListZonesOutput = {
  items: ZoneItem[]
}

