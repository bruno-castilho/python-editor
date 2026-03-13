import { TRPCError } from '@trpc/server'
import { InvalidEmailVerificationTokenError } from '../../use-cases/errors/invalid-email-verification-token-error'

export function verifyEmailErrorHandler(error: unknown) {
  if (error instanceof InvalidEmailVerificationTokenError) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: error.message,
    })
  }
  throw error
}
