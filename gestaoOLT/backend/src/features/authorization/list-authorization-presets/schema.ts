import { z } from 'zod'

export const ListAuthorizationPresetsInputSchema = z.object({
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(100).default(20),
})

export const AuthorizationPresetItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  is_default: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ListAuthorizationPresetsOutputSchema = z.object({
  items: z.array(AuthorizationPresetItemSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})

