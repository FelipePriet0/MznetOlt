export type UplinkErrorsSeriesInput = {
  olt_id: number
}

export type UplinkErrorsSeriesItem = {
  collected_at: string
  errors: number
}

export type UplinkErrorsSeriesOutput = {
  items: UplinkErrorsSeriesItem[]
}

