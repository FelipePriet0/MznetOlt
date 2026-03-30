export type ListPonPortsByBoardInput = {
  board_id?: number
}

export type PonPortItem = {
  id: number
  name: string
  pon_index: number
  board_id?: number
  admin_state: string
  description: string | null
  min_range_meters: number
  max_range_meters: number
  onu_total: number
  onu_online: number
  avg_rx_dbm: number | null
}
