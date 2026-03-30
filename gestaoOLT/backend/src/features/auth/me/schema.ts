import { z } from 'zod'

export const MeInputSchema = z.object({
  user_id: z.number().int().positive(),
})

export const MeOutputSchema = z.object({
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
