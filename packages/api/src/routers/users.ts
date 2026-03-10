import { publicProcedure, router } from '../index'
import { registerUserSchema } from '@python-editor/schemas/register-user'
import { verifyEmailSchema } from '@python-editor/schemas/verify-email'
import { resendemailverificationSchema } from '@python-editor/schemas/resend-email-verification'
import { forgotPasswordSchema } from '@python-editor/schemas/forgot-password'
import { resetPasswordSchema } from '@python-editor/schemas/reset-password'
import { makeRegisterUserUseCase } from '../use-cases/factories/make-register-user'
import { makeVerifyEmailUseCase } from '../use-cases/factories/make-verify-email'
import { makeResendEmailVerificationUseCase } from '../use-cases/factories/make-resend-email-verification'
import { makeForgotPasswordUseCase } from '../use-cases/factories/make-forgot-password'
import { makeResetPasswordUseCase } from '../use-cases/factories/make-reset-password'
import { InvalidPasswordResetTokenError } from '../use-cases/errors/invalid-password-reset-token-error'
import { TRPCError } from '@trpc/server'

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

  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input }) => {
      const forgotPasswordUseCase = makeForgotPasswordUseCase()
      await forgotPasswordUseCase.execute(input)

      return {
        message: 'Você receberá um e-mail para alterar sua senha.',
      }
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      const { token, password } = input
      const resetPasswordUseCase = makeResetPasswordUseCase()

      try {
        await resetPasswordUseCase.execute({ token, password })
      } catch (e) {
        if (e instanceof InvalidPasswordResetTokenError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: e.message,
          })
        }
        throw e
      }

      return {
        message: 'Senha redefinida com sucesso!',
      }
    }),
})

export type UserRouter = typeof userRouter
