import { TRPCError } from '@trpc/server'
import { SessionDoesNotExistsError } from '../../use-cases/errors/session-does-not-exists-error'

export function revokeUserSessionErrorHandler(error: unknown) {
  if (error instanceof SessionDoesNotExistsError) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: error.message,
    })
  }
  throw error
}
