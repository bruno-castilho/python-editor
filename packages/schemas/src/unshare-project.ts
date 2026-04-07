import z from 'zod'

export const unshareProjectSchema = z.object({
  projectId: z.uuid(),
  email: z.email({ message: 'Invalid email' }),
})

export type UnshareProjectDTO = z.infer<typeof unshareProjectSchema>
