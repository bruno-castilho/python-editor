import z from 'zod'

export const resendemailverificationSchema = z.object({
  email: z.email({ message: 'Invalid email' }),
})

export type ResendEmailVerificationDTO = z.infer<
  typeof resendemailverificationSchema
>
