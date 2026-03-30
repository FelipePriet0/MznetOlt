export type GetOltHealthInput = {
  olt_id: number
}

export type OltHealthItem = {
  cpu_usage: number
  memory_usage: number
  temperature: number
  fan_status: string
  collected_at: string
}

export type GetOltHealthOutput = {
  item: OltHealthItem | null
}

