import { publicProcedure, router } from '../index'
import { registerUserSchema } from '@python-editor/schemas/register-user'
import { verifyEmailSchema } from '@python-editor/schemas/verify-email'
import { resendemailverificationSchema } from '@python-editor/schemas/resend-email-verification'
import { makeRegisterUserUseCase } from '../use-cases/factories/make-register-user'
import { makeVerifyEmailUseCase } from '../use-cases/factories/make-verify-email'
import { makeResendEmailVerificationUseCase } from '../use-cases/factories/make-resend-email-verification'

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

  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input }) => {
      const verifyEmailUseCase = makeVerifyEmailUseCase()

      await verifyEmailUseCase.execute(input)

      return {
        message: 'E-mail verificado com sucesso!',
      }
    }),

  resendVerificationEmail: publicProcedure
    .input(resendemailverificationSchema)
    .mutation(async ({ input }) => {
      const resendEmailVerificationUseCase =
        makeResendEmailVerificationUseCase()

      await resendEmailVerificationUseCase.execute(input)

      return {
        message: 'Um novo link foi enviado para o seu e-mail.',
      }
    }),
})

export type UserRouter = typeof userRouter
