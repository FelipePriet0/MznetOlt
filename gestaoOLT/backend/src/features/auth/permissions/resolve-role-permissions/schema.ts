import { z } from 'zod'

export const RoleCodeSchema = z.enum(['reader', 'technician', 'admin'])

export const ResolveRolePermissionsInputSchema = z.object({
  role_code: RoleCodeSchema,
})

export const ResolvedPermissionsSchema = z.object({
  can_read: z.boolean(),
  can_operate: z.boolean(),
  can_manage_settings: z.boolean(),
  is_admin: z.boolean(),
})

export const ResolveRolePermissionsOutputSchema = z.object({
  permissions: ResolvedPermissionsSchema,
})
