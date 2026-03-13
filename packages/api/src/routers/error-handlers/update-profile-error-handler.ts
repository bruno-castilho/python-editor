import { TRPCError } from '@trpc/server'
import { InvalidCurrentPasswordError } from '../../use-cases/errors/invalid-current-password-error'
import { UserDoesNotExistsError } from '../../use-cases/errors/user-does-not-exists-error'

export function updateProfileErrorHandler(error: unknown) {
  if (error instanceof UserDoesNotExistsError) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: error.message,
    })
  }
  if (error instanceof InvalidCurrentPasswordError) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: error.message,
    })
  }
  throw error
}
