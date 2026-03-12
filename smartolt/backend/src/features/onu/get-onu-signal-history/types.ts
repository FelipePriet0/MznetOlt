export type GetOnuSignalHistoryInput = {
  id: number
  limit?: number
}

export type OnuSignalSample = {
  time: string
  rx: number
  tx: number | null
}

export type OnuSignalHistoryOutput = {
  items: OnuSignalSample[]
}

