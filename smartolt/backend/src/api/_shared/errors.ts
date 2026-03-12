import type { ApiResponse } from './types'
import {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessable,
  serverError,
} from './http'

export function mapErrorToResponse(res: ApiResponse, error: unknown): void {
  if (!(error instanceof Error)) {
    serverError(res)
    return
  }

  switch (error.name) {
    case 'InvalidCredentialsError':
      unauthorized(res, error.message)
      break
    case 'InactiveUserError':
      forbidden(res, error.message)
      break
    case 'OltNotFoundError':
    case 'OnuNotFoundError':
      notFound(res, error.message)
      break
    case 'DuplicateMgmtIpError':
      conflict(res, error.message)
      break
    case 'LocationNotFoundError':
    case 'ZoneNotFoundError':
      unprocessable(res, error.message)
      break
    case 'MissingRequiredFieldsError':
      badRequest(res, error.message)
      break
    case 'ZodError':
      badRequest(res, error.message)
      break
    default:
      console.error('[API Error]', error)
      serverError(res, error.message)
  }
}
