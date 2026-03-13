import { TRPCError } from '@trpc/server'
import { UserAlreadyExistsError } from '../../use-cases/errors/user-already-exists-error'

export function registerUserErrorHandler(error: unknown) {
  if (error instanceof UserAlreadyExistsError) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: error.message,
    })
  }
  throw error
}
