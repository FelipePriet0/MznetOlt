export type ListTasksInput = {}

export type TaskItem = {
  id: number
  job_name: string
  status: string
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  stats_json: unknown
}

export type ListTasksOutput = {
  items: TaskItem[]
}

