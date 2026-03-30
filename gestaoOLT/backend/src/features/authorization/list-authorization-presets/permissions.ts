const ALLOWED_ROLES = ['reader', 'technician', 'admin'] as const

export function canListAuthorizationPresets(roleCode: string): boolean {
  return (ALLOWED_ROLES as readonly string[]).includes(roleCode)
}

