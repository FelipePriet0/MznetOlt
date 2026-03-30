const ALLOWED_ROLES = ['reader', 'technician', 'admin'] as const

export function canListOlts(roleCode: string): boolean {
  return (ALLOWED_ROLES as readonly string[]).includes(roleCode)
}
