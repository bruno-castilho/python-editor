import z from 'zod'

export const registerUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: 'Enter a first name' })
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, {
        message: 'Name must contain only letters',
      }),

    lastName: z
      .string()
      .trim()
      .min(1, { message: 'Enter a last name' })
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, {
        message: 'Last name must contain only letters',
      }),

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

    repeatPassword: z
      .string()
      .trim()
      .min(1, { message: 'This field cannot be empty' }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    path: ['repeat_password'],
    message: 'Passwords do not match',
  })

export type RegisterUserDTO = z.infer<typeof registerUserSchema>
