import z from 'zod'

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, { message: 'Enter a first name' }),

    lastName: z.string().trim().min(1, { message: 'Enter a last name' }),

    newPassword: z
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
      })
      .optional()
      .or(z.literal('')),

    repeatPassword: z
      .string()
      .trim()
      .min(1, { message: 'This field cannot be empty' })
      .optional()
      .or(z.literal('')),

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
  .refine(
    (data) => !data.newPassword || data.newPassword === data.repeatPassword,
    {
      path: ['repeatPassword'],
      message: 'Passwords do not match',
    },
  )

export type UpdateUserDTO = z.infer<typeof updateUserSchema>
