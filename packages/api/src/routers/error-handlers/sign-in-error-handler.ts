import { TRPCError } from '@trpc/server'
import { InvalidCredentialsError } from '../../use-cases/errors/invalid-credentials-error'
import { EmailNotVerifiedError } from '../../use-cases/errors/email-not-verified-error'

export function signInErrorHandler(error: unknown) {
  if (error instanceof InvalidCredentialsError) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: error.message,
    })
  }

  if (error instanceof EmailNotVerifiedError) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: error.message,
    })
  }

  throw error
}
