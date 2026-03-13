import { authenticatedProcedure, publicProcedure, router } from '../index'
import { registerUserSchema } from '@python-editor/schemas/register-user'
import { verifyEmailSchema } from '@python-editor/schemas/verify-email'
import { resendemailverificationSchema } from '@python-editor/schemas/resend-email-verification'
import { forgotPasswordSchema } from '@python-editor/schemas/forgot-password'
import { resetPasswordSchema } from '@python-editor/schemas/reset-password'
import { updateUserSchema } from '@python-editor/schemas/update-user'
import { makeRegisterUserUseCase } from '../use-cases/factories/make-register-user'
import { makeVerifyEmailUseCase } from '../use-cases/factories/make-verify-email'
import { makeResendEmailVerificationUseCase } from '../use-cases/factories/make-resend-email-verification'
import { makeForgotPasswordUseCase } from '../use-cases/factories/make-forgot-password'
import { makeResetPasswordUseCase } from '../use-cases/factories/make-reset-password'
import { makeGetProfileUseCase } from '../use-cases/factories/make-get-profile'
import { makeUpdateProfileUseCase } from '../use-cases/factories/make-update-profile'
import { InvalidPasswordResetTokenError } from '../use-cases/errors/invalid-password-reset-token-error'
import { InvalidCurrentPasswordError } from '../use-cases/errors/invalid-current-password-error'
import { UserNotFoundError } from '../use-cases/errors/user-not-found-error'
import { TRPCError } from '@trpc/server'

export const usersRouter = router({
  registerUser: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ input: dto }) => {
      const registerUserUseCase = makeRegisterUserUseCase()
      await registerUserUseCase.execute({ dto })

      return {
        message:
          'Conta criada com sucesso! Verifique seu e-mail para ativar a conta.',
      }
    }),

  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input: dto }) => {
      const verifyEmailUseCase = makeVerifyEmailUseCase()

      await verifyEmailUseCase.execute({ dto })

      return {
        message: 'E-mail verificado com sucesso!',
      }
    }),

  resendVerificationEmail: publicProcedure
    .input(resendemailverificationSchema)
    .mutation(async ({ input: dto }) => {
      const resendEmailVerificationUseCase =
        makeResendEmailVerificationUseCase()

      await resendEmailVerificationUseCase.execute({ dto })

      return {
        message: 'Um novo link foi enviado para o seu e-mail.',
      }
    }),

  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input: dto }) => {
      const forgotPasswordUseCase = makeForgotPasswordUseCase()
      await forgotPasswordUseCase.execute({ dto })

      return {
        message: 'Você receberá um e-mail para alterar sua senha.',
      }
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input: dto }) => {
      const resetPasswordUseCase = makeResetPasswordUseCase()

      try {
        await resetPasswordUseCase.execute({ dto })
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

  getProfile: authenticatedProcedure.query(async ({ ctx }) => {
    const getProfileUseCase = makeGetProfileUseCase()

    try {
      const { user } = await getProfileUseCase.execute({
        userId: ctx.session.userId,
      })
      return { user }
    } catch (e) {
      if (e instanceof UserNotFoundError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: e.message,
        })
      }
      throw e
    }
  }),

  updateProfile: authenticatedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input: dto }) => {
      const updateProfileUseCase = makeUpdateProfileUseCase()

      const { userId } = ctx.session

      try {
        await updateProfileUseCase.execute({
          userId,
          dto,
        })

        return { message: 'Perfil atualizado com sucesso!' }
      } catch (e) {
        if (e instanceof UserNotFoundError) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: e.message,
          })
        }
        if (e instanceof InvalidCurrentPasswordError) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: e.message,
          })
        }
        throw e
      }
    }),
})

export type UserRouter = typeof usersRouter
