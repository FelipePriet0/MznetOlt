const ALLOWED_ROLES = ['reader', 'technician', 'admin'] as const

type AllowedRole = typeof ALLOWED_ROLES[number]

export function canListRoles(roleCode: string): boolean {
  return (ALLOWED_ROLES as readonly string[]).includes(roleCode)
}
