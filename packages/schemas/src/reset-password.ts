import z from 'zod'

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: 'Invalid token' }),

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

    repeatPassword: z
      .string()
      .trim()
      .min(1, { message: 'This field cannot be empty' }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    path: ['repeatPassword'],
    message: 'Passwords do not match',
  })

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>
