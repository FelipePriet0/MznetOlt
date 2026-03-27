import { listPonPortsByBoardRepository } from './repository'
import type { ListPonPortsByBoardInput, PonPortItem } from './types'

export async function listPonPortsByBoardService(input: ListPonPortsByBoardInput): Promise<PonPortItem[]> {
  return listPonPortsByBoardRepository(input.board_id)
}

