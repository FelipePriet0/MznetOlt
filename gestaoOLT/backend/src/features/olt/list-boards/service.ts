import { listBoardsByOltRepository } from './repository'
import type { ListBoardsByOltInput, BoardItem } from './types'

export async function listBoardsByOltService(input: ListBoardsByOltInput): Promise<BoardItem[]> {
  return listBoardsByOltRepository(input.olt_id)
}

