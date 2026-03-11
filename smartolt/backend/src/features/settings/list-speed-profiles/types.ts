export type ListSpeedProfilesInput = {}

export type SpeedProfileItem = {
  id: number
  name: string
  download_mbps: number
  upload_mbps: number
  created_at: string
}

export type ListSpeedProfilesOutput = {
  items: SpeedProfileItem[]
}

