import { authenticatedProcedure, publicProcedure, router } from '../index'
import { registerUserSchema } from '@python-editor/schemas/register-user'
import { revokeUserSessionSchema } from '@python-editor/schemas/revoke-user-session'
import { verifyEmailSchema } from '@python-editor/schemas/verify-email'
import { resendemailverificationSchema } from '@python-editor/schemas/resend-email-verification'
import { forgotPasswordSchema } from '@python-editor/schemas/forgot-password'
import { resetPasswordSchema } from '@python-editor/schemas/reset-password'
import { updateUserSchema } from '@python-editor/schemas/update-user'
import { makeRegisterUserUseCase } from '@python-editor/core/infra/factories/make-register-user'
import { makeVerifyEmailUseCase } from '@python-editor/core/infra/factories/make-verify-email'
import { makeResendEmailVerificationUseCase } from '@python-editor/core/infra/factories/make-resend-email-verification'
import { makeForgotPasswordUseCase } from '@python-editor/core/infra/factories/make-forgot-password'
import { makeResetPasswordUseCase } from '@python-editor/core/infra/factories/make-reset-password'
import { makeGetProfileUseCase } from '@python-editor/core/infra/factories/make-get-profile'
import { makeUpdateProfileUseCase } from '@python-editor/core/infra/factories/make-update-profile'
import { makeRemoveAvatar } from '@python-editor/core/infra/factories/make-remove-avatar'
import { makeGetUserSessionsUseCase } from '@python-editor/core/infra/factories/make-get-user-sessions'
import { makeRevokeUserSessionUseCase } from '@python-editor/core/infra/factories/make-revoke-user-session'

export const usersRouter = router({
  registerUser: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ input: dto }) => {
      const registerUserUseCase = makeRegisterUserUseCase()
      await registerUserUseCase.execute({ dto })

      return {
        message:
          'Account created successfully! Check your email to activate your account.',
      }
    }),

  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input: dto }) => {
      const verifyEmailUseCase = makeVerifyEmailUseCase()
      await verifyEmailUseCase.execute({ dto })

      return {
        message: 'Email verified successfully!',
      }
    }),

  resendVerificationEmail: publicProcedure
    .input(resendemailverificationSchema)
    .mutation(async ({ input: dto }) => {
      const resendEmailVerificationUseCase =
        makeResendEmailVerificationUseCase()
      await resendEmailVerificationUseCase.execute({ dto })

      return {
        message: 'A new link has been sent to your email.',
      }
    }),

  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input: dto }) => {
      const forgotPasswordUseCase = makeForgotPasswordUseCase()
      await forgotPasswordUseCase.execute({ dto })

      return {
        message: 'You will receive an email to reset your password.',
      }
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input: dto }) => {
      const resetPasswordUseCase = makeResetPasswordUseCase()
      await resetPasswordUseCase.execute({ dto })
      return {
        message: 'Password reset successfully!',
      }
    }),

  getProfile: authenticatedProcedure.query(async ({ ctx }) => {
    const getProfileUseCase = makeGetProfileUseCase()
    const { user } = await getProfileUseCase.execute({
      userId: ctx.session.userId,
    })

    return { user }
  }),

  updateProfile: authenticatedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input: dto }) => {
      const updateProfileUseCase = makeUpdateProfileUseCase()
      const { userId } = ctx.session
      await updateProfileUseCase.execute({ userId, dto })

      return { message: 'Profile updated successfully!' }
    }),

  removeAvatar: authenticatedProcedure.mutation(async ({ ctx }) => {
    const removeAvatarUseCase = makeRemoveAvatar()
    await removeAvatarUseCase.execute({ userId: ctx.session.userId })
    return { message: 'Avatar removed successfully!' }
  }),

  getUserSessions: authenticatedProcedure.query(async ({ ctx }) => {
    const useCase = makeGetUserSessionsUseCase()
    return await useCase.execute({ userId: ctx.session.userId })
  }),

  revokeUserSession: authenticatedProcedure
    .input(revokeUserSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const { sessionId } = input
      const useCase = makeRevokeUserSessionUseCase()
      await useCase.execute({
        dto: { sessionId },
        userId: ctx.session.userId,
      })
      return { message: 'Session revoked successfully.' }
    }),
})

export type UserRouter = typeof usersRouter
