const ALLOWED_ROLES = ['technician', 'admin'] as const

export function canAuthorizeOnu(roleCode: string): boolean {
  return (ALLOWED_ROLES as readonly string[]).includes(roleCode)
}

