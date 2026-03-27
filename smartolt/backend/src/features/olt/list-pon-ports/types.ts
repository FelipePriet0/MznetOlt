export type ListPonPortsByBoardInput = {
  board_id?: number
}

export type PonPortItem = {
  id: number
  name: string
  pon_index: number
  board_id?: number
}

