import { ResolveRolePermissionsInputSchema } from './schema'
import type { ResolveRolePermissionsInput, ResolveRolePermissionsOutput, ResolvedPermissions } from './types'

const PERMISSIONS_MAP: Record<string, ResolvedPermissions> = {
  reader: {
    can_read: true,
    can_operate: false,
    can_manage_settings: false,
    is_admin: false,
  },
  technician: {
    can_read: true,
    can_operate: true,
    can_manage_settings: false,
    is_admin: false,
  },
  admin: {
    can_read: true,
    can_operate: true,
    can_manage_settings: true,
    is_admin: true,
  },
}

export function resolveRolePermissionsService(
  input: ResolveRolePermissionsInput
): ResolveRolePermissionsOutput {
  const parsed = ResolveRolePermissionsInputSchema.parse(input)

  return {
    permissions: PERMISSIONS_MAP[parsed.role_code],
  }
}
