import z from 'zod'

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: 'Digite um nome' })
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, {
        message: 'O nome deve conter apenas letras',
      }),

    lastName: z
      .string()
      .trim()
      .min(1, { message: 'Digite um sobrenome' })
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, {
        message: 'O sobrenome deve conter apenas letras',
      }),

    newPassword: z
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
      })
      .optional()
      .or(z.literal('')),

    repeatPassword: z
      .string()
      .trim()
      .min(1, { message: 'Este campo não pode ficar vazio' })
      .optional()
      .or(z.literal('')),

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
  .refine(
    (data) => !data.newPassword || data.newPassword === data.repeatPassword,
    {
      path: ['repeatPassword'],
      message: 'As senhas não coincidem',
    },
  )

export type UpdateUserDTO = z.infer<typeof updateUserSchema>
