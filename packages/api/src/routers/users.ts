import { publicProcedure, router } from '../index'
import { registerUserSchema } from '@python-editor/schemas/register-user'

import { makeRegisterUserUseCase } from '../use-cases/factories/make-register-user'

export const userRouter = router({
  registerUser: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ input }) => {
      const registerUserUseCase = makeRegisterUserUseCase()
      await registerUserUseCase.execute(input)

      return {
        message:
          'Conta criada com sucesso! Verifique seu e-mail para ativar a conta.',
      }
    }),
})

export type UserRouter = typeof userRouter
