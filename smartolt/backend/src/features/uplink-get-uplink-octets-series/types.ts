export type UplinkOctetsSeriesInput = {
  olt_id: number
}

export type UplinkOctetsSeriesItem = {
  collected_at: string
  octets: number
}

export type UplinkOctetsSeriesOutput = {
  items: UplinkOctetsSeriesItem[]
}

