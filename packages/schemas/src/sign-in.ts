import z from 'zod'

export const signInSchema = z.object({
  email: z.email({ message: 'Invalid email' }),
  password: z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/(?=.*[A-Z])/, {
      message: 'Password must contain at least one uppercase letter',
    })
    .regex(/(?=.*[0-9])/, {
      message: 'Password must contain at least one number',
    })
    .regex(/(?=.*[!@#$%^&*(),.?":{}|<>])/, {
      message: 'Password must contain at least one special character',
    }),
})

export type SignInDTO = z.infer<typeof signInSchema>
