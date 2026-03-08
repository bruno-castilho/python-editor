import z from 'zod'

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: 'Token inválido' }),
})

export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>
