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
import { registerUserErrorHandler } from './error-handlers/register-user-error-handler'
import { verifyEmailErrorHandler } from './error-handlers/verify-email-error-handler'
import { resendVerificationEmailErrorHandler } from './error-handlers/resend-verification-email-error-handler'
import { forgotPasswordErrorHandler } from './error-handlers/forgot-password-error-handler'
import { resetPasswordErrorHandler } from './error-handlers/reset-password-erro-handler'
import { getProfileErrorHandler } from './error-handlers/get-profile-error-handler'
import { updateProfileErrorHandler } from './error-handlers/update-profile-error-handler'

export const usersRouter = router({
  registerUser: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ input: dto }) => {
      try {
        const registerUserUseCase = makeRegisterUserUseCase()
        await registerUserUseCase.execute({ dto })

        return {
          message:
            'Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.',
        }
      } catch (error) {
        registerUserErrorHandler(error)
      }
    }),

  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input: dto }) => {
      try {
        const verifyEmailUseCase = makeVerifyEmailUseCase()

        await verifyEmailUseCase.execute({ dto })

        return {
          message: 'E-mail verificado com sucesso!',
        }
      } catch (error) {
        verifyEmailErrorHandler(error)
      }
    }),

  resendVerificationEmail: publicProcedure
    .input(resendemailverificationSchema)
    .mutation(async ({ input: dto }) => {
      try {
        const resendEmailVerificationUseCase =
          makeResendEmailVerificationUseCase()

        await resendEmailVerificationUseCase.execute({ dto })

        return {
          message: 'Um novo link foi enviado para o seu e-mail.',
        }
      } catch (error) {
        resendVerificationEmailErrorHandler(error)
      }
    }),

  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input: dto }) => {
      try {
        const forgotPasswordUseCase = makeForgotPasswordUseCase()
        await forgotPasswordUseCase.execute({ dto })

        return {
          message: 'Você receberá um e-mail para alterar sua senha.',
        }
      } catch (error) {
        forgotPasswordErrorHandler(error)
      }
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input: dto }) => {
      try {
        const resetPasswordUseCase = makeResetPasswordUseCase()
        await resetPasswordUseCase.execute({ dto })
        return {
          message: 'Senha redefinida com sucesso!',
        }
      } catch (error) {
        resetPasswordErrorHandler(error)
      }
    }),

  getProfile: authenticatedProcedure.query(async ({ ctx }) => {
    try {
      const getProfileUseCase = makeGetProfileUseCase()
      const { user } = await getProfileUseCase.execute({
        userId: ctx.session.userId,
      })
      return { user }
    } catch (error) {
      getProfileErrorHandler(error)
    }
  }),

  updateProfile: authenticatedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input: dto }) => {
      try {
        const updateProfileUseCase = makeUpdateProfileUseCase()

        const { userId } = ctx.session

        await updateProfileUseCase.execute({
          userId,
          dto,
        })

        return { message: 'Perfil atualizado com sucesso!' }
      } catch (error) {
        updateProfileErrorHandler(error)
      }
    }),
})

export type UserRouter = typeof usersRouter
