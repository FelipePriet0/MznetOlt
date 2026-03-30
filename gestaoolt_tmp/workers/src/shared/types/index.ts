/**
 * Shared Worker Types
 */

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface JobContext {
  id: string
  name: string
  status: JobStatus
  startedAt: Date
  completedAt?: Date
  error?: string
}

export interface JobResult {
  success: boolean
  itemsProcessed: number
  itemsFailed: number
  duration: number
  error?: string
}
