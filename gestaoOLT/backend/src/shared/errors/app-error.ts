/**
 * Base Application Error
 *
 * All domain-specific errors should extend this base class.
 * Provides standardized error handling across features.
 */

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id "${id}" not found` : `${resource} not found`
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Forbidden Error (Permission Denied)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403)
    this.name = 'ForbiddenError'
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, details)
    this.name = 'ConflictError'
  }
}
