import { TRPCError } from '@trpc/server'
import { UserDoesNotExistsError } from '../../use-cases/errors/user-does-not-exists-error'

export function getProfileErrorHandler(error: unknown) {
  if (error instanceof UserDoesNotExistsError) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: error.message,
    })
  }
  throw error
}
