import { z } from 'zod'

export const removeProjectSchema = z.object({
  projectId: z.string().uuid(),
})

export type RemoveProjectDTO = z.infer<typeof removeProjectSchema>
