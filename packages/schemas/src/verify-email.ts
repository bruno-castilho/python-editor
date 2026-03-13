import z from 'zod'

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: 'Invalid token' }),
})

export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>
