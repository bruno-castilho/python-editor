import { z } from 'zod'

export const findPersonalProjectsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'updatedAt']).default('updatedAt'),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
})

export type FindPersonalProjectsDTO = z.infer<typeof findPersonalProjectsSchema>
