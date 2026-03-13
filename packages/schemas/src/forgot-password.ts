import z from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Invalid email' }),
})

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>
