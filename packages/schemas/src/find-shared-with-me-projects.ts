import { z } from 'zod'

export const findSharedWithMeProjectsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'updatedAt']).default('updatedAt'),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
})

export type FindSharedWithMeProjectsDTO = z.infer<
  typeof findSharedWithMeProjectsSchema
>
