import { publicProcedure, router } from '../index'
import { registerUserSchema } from '@python-editor/schemas/register-user'
import { makeRegisterUserService } from '../services/users/factories/make-register-user-service'

export const userRouter = router({
  registerUser: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ input }) => {
      const registerUserService = makeRegisterUserService()
      await registerUserService.execute(input)

      return {
        message: 'Conta criada com sucesso!',
      }
    }),
})

export type UserRouter = typeof userRouter
