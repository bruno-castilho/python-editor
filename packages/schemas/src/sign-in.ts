import z from 'zod'

export const signInSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
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
})

export type SignInDTO = z.infer<typeof signInSchema>
