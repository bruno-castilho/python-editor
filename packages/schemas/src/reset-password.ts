import z from 'zod'

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: 'Token inválido' }),

    password: z
      .string()
      .trim()
      .min(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
      .regex(/(?=.*[A-Z])/, {
        message: 'A senha deve conter pelo menos uma letra maiúscula',
      })
      .regex(/(?=.*[0-9])/, {
        message: 'A senha deve conter pelo menos um número',
      })
      .regex(/(?=.*[!@#$%^&*(),.?":{}|<>])/, {
        message: 'A senha deve conter pelo menos um símbolo especial',
      }),

    repeatPassword: z
      .string()
      .trim()
      .min(1, { message: 'Este campo não pode ficar vazio' }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    path: ['repeatPassword'],
    message: 'As senhas não coincidem',
  })

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>
