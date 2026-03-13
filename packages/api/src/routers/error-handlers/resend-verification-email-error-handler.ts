import { TRPCError } from '@trpc/server'
import { EmailAlreadyVerifiedError } from '../../use-cases/errors/email-already-verified-error'
import { UserDoesNotExistsError } from '../../use-cases/errors/user-does-not-exists-error'

export function resendVerificationEmailErrorHandler(error: unknown) {
  if (error instanceof UserDoesNotExistsError) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: error.message,
    })
  }
  if (error instanceof EmailAlreadyVerifiedError) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: error.message,
    })
  }

  throw error
}
