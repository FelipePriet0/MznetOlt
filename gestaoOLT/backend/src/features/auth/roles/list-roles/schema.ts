import { z } from 'zod'

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ListRolesOutputSchema = z.array(RoleSchema)
