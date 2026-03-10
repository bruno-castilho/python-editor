import z from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
})

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>
