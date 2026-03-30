import { z } from 'zod'

export const ListUsersInputSchema = z.object({
  role_id: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(100).default(20),
})

export const UserWithRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  is_active: z.boolean(),
  role_id: z.number(),
  role_name: z.string(),
  role_code: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ListUsersOutputSchema = z.object({
  items: z.array(UserWithRoleSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})
