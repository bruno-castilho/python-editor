import z from 'zod'

export const shareProjectSchema = z.object({
  projectId: z.uuid(),
  email: z.email({ message: 'Invalid email' }),
})

export type ShareProjectDTO = z.infer<typeof shareProjectSchema>
