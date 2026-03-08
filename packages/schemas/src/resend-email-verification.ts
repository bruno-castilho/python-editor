import z from 'zod'

export const resendemailverificationSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
})

export type ResendEmailVerificationDTO = z.infer<
  typeof resendemailverificationSchema
>
