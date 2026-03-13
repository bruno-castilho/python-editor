import { TRPCError } from '@trpc/server'
import { InvalidPasswordResetTokenError } from '../../use-cases/errors/invalid-password-reset-token-error'

export function resetPasswordErrorHandler(error: unknown) {
  if (error instanceof InvalidPasswordResetTokenError) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: error.message,
    })
  }
  throw error
}
