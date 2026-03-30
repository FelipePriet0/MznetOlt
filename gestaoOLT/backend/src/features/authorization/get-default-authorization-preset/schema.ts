import { z } from 'zod'

export const GetDefaultAuthorizationPresetInputSchema = z.object({})

export const AuthorizationPresetItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  is_default: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const GetDefaultAuthorizationPresetOutputSchema = z.object({
  item: AuthorizationPresetItemSchema,
})

