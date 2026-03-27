export type GetOnuTrafficInput = { id: number; limit?: number }

export type TrafficSample = {
  collected_at: string
  rx_mbps: number | null
  tx_mbps: number | null
}

export type TrafficStats = {
  rx_max: number | null
  tx_max: number | null
  rx_avg: number | null
  tx_avg: number | null
}

export type GetOnuTrafficOutput = {
  items: TrafficSample[]
  stats: TrafficStats
}
