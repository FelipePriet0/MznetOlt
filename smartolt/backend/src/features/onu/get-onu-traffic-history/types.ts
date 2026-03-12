export type GetOnuTrafficHistoryInput = {
  id: number
  limit?: number
}

export type OnuTrafficSample = {
  time: string
  upload: number
  download: number
}

export type OnuTrafficHistoryOutput = {
  items: OnuTrafficSample[]
}

