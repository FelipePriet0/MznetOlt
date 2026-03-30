export type ListExportsInput = {}

export type ExportItem = {
  id: number
  export_type: string
  status: string
  file_url: string | null
  created_at: string
  finished_at: string | null
}

export type ListExportsOutput = {
  items: ExportItem[]
}

