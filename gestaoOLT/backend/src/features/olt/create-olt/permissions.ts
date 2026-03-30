const ALLOWED_ROLES = ['admin'] as const

export function canCreateOlt(roleCode: string): boolean {
  return (ALLOWED_ROLES as readonly string[]).includes(roleCode)
}
