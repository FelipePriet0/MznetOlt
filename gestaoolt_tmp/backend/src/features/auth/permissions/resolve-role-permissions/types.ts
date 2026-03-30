export type RoleCode = 'reader' | 'technician' | 'admin'

export type ResolveRolePermissionsInput = {
  role_code: RoleCode
}

export type ResolvedPermissions = {
  can_read: boolean
  can_operate: boolean
  can_manage_settings: boolean
  is_admin: boolean
}

export type ResolveRolePermissionsOutput = {
  permissions: ResolvedPermissions
}
