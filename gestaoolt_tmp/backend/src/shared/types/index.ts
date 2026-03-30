/**
 * Shared Domain Types
 *
 * Common types used across features.
 * Domain-specific types should live in their respective feature folders.
 */

/**
 * User Roles
 */
export enum UserRole {
  ADMIN = 'admin',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer',
}

/**
 * User Context (from JWT/Auth middleware)
 */
export interface UserContext {
  id: string
  email: string
  role: UserRole
  createdAt: Date
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  timestamp: string
}

/**
 * Pagination
 */
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Entity Base Fields
 */
export interface EntityBase {
  id: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Feature Status
 */
export enum FeatureStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
}
