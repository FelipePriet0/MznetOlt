export type ListOnuTypesInput = {}

export type OnuTypeItem = {
  id: number
  name: string
  vendor: string
  created_at: string
}

export type ListOnuTypesOutput = {
  items: OnuTypeItem[]
}

