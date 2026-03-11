export type TrafficPonSeriesInput = {
  start_at: string
  end_at: string
  olt_id?: number
  pon_port_id?: number
}

export type TrafficPonSeriesItem = {
  collected_at: string
  download_bytes: number
  upload_bytes: number
}

export type TrafficPonSeriesOutput = {
  items: TrafficPonSeriesItem[]
}
