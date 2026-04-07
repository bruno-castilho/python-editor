import { TRPCError } from '@trpc/server'
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { EmailAlreadyVerifiedError } from './use-cases/errors/email-already-verified-error'
import { EmailNotVerifiedError } from './use-cases/errors/email-not-verified-error'
import { InvalidCredentialsError } from './use-cases/errors/invalid-credentials-error'
import { InvalidCurrentPasswordError } from './use-cases/errors/invalid-current-password-error'
import { InvalidEmailVerificationTokenError } from './use-cases/errors/invalid-email-verification-token-error'
import { InvalidPasswordResetTokenError } from './use-cases/errors/invalid-password-reset-token-error'
import { NotAllowedToRemoveProjectError } from './use-cases/errors/not-allowed-to-remove-project-error'
import { ProjectDoesNotExistError } from './use-cases/errors/project-does-not-exist-error'
import { SessionDoesNotExistsError } from './use-cases/errors/session-does-not-exists-error'
import { UserAlreadyExistsError } from './use-cases/errors/user-already-exists-error'
import { UserDoesNotExistsError } from './use-cases/errors/user-does-not-exists-error'

type AnyErrorConstructor = new (...args: never[]) => Error

const ERROR_MAP: Array<[AnyErrorConstructor, TRPC_ERROR_CODE_KEY]> = [
  [UserDoesNotExistsError, 'NOT_FOUND'],
  [UserAlreadyExistsError, 'CONFLICT'],
  [InvalidCredentialsError, 'UNAUTHORIZED'],
  [EmailNotVerifiedError, 'FORBIDDEN'],
  [EmailAlreadyVerifiedError, 'BAD_REQUEST'],
  [InvalidEmailVerificationTokenError, 'UNAUTHORIZED'],
  [SessionDoesNotExistsError, 'UNAUTHORIZED'],
  [InvalidPasswordResetTokenError, 'UNAUTHORIZED'],
  [InvalidCurrentPasswordError, 'FORBIDDEN'],
  [ProjectDoesNotExistError, 'NOT_FOUND'],
  [NotAllowedToRemoveProjectError, 'FORBIDDEN'],
]

export function handleError(error: unknown): never {
  for (const [ErrorClass, code] of ERROR_MAP) {
    if (error instanceof ErrorClass) {
      throw new TRPCError({ code, message: error.message })
    }
  }
  throw error
}
