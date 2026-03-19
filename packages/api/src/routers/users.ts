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
import { makeRemoveAvatar } from '../use-cases/factories/make-remove-avatar'
import { registerUserErrorHandler } from './error-handlers/register-user-error-handler'
import { verifyEmailErrorHandler } from './error-handlers/verify-email-error-handler'
import { resendVerificationEmailErrorHandler } from './error-handlers/resend-verification-email-error-handler'
import { forgotPasswordErrorHandler } from './error-handlers/forgot-password-error-handler'
import { resetPasswordErrorHandler } from './error-handlers/reset-password-erro-handler'
import { getProfileErrorHandler } from './error-handlers/get-profile-error-handler'
import { updateProfileErrorHandler } from './error-handlers/update-profile-error-handler'
import { removeAvatarErrorHandler } from './error-handlers/remove-avatar-error-handler'
import { env } from '@python-editor/env/server'

export const usersRouter = router({
  registerUser: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ input: dto }) => {
      try {
        const registerUserUseCase = makeRegisterUserUseCase()
        await registerUserUseCase.execute({ dto })

        return {
          message:
            'Account created successfully! Check your email to activate your account.',
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
          message: 'Email verified successfully!',
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
          message: 'A new link has been sent to your email.',
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
          message: 'You will receive an email to reset your password.',
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
          message: 'Password reset successfully!',
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

      const avatarUrl = user.avatar
        ? `${env.STORAGE_PUBLIC_URL}/${user.avatar}`
        : null
      return { user: { ...user, avatarUrl } }
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

        return { message: 'Profile updated successfully!' }
      } catch (error) {
        updateProfileErrorHandler(error)
      }
    }),

  removeAvatar: authenticatedProcedure.mutation(async ({ ctx }) => {
    try {
      const removeAvatarUseCase = makeRemoveAvatar()
      await removeAvatarUseCase.execute({ userId: ctx.session.userId })
      return { message: 'Avatar removed successfully!' }
    } catch (error) {
      removeAvatarErrorHandler(error)
    }
  }),
})

export type UserRouter = typeof usersRouter
