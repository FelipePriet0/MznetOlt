export type ListBoardsByOltInput = {
  olt_id?: number
}

export type BoardItem = {
  id:             number
  name:           string
  slot_index:     number
  olt_id?:        number
  board_type:     string | null
  board_hw_id:    string | null
  board_status:   string
  board_role:     string
  terminal_count: number | null
  pon_port_count: number
  created_at:     string
  updated_at:     string
}
