export type GetSignalHistoryInput = {
  onu_id: number
  limit?: number
  period?: 'day' | 'week' | 'month' | 'year'
}

export type SignalPoint = {
  ts: string
  value: number
}

export type GetSignalHistoryOutput = {
  items: SignalPoint[]
}
