const ALLOWED_ROLES = ['reader', 'technician', 'admin'] as const

export function canListUsers(roleCode: string): boolean {
  return (ALLOWED_ROLES as readonly string[]).includes(roleCode)
}
