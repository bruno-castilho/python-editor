import { TRPCError } from '@trpc/server'
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { EmailAlreadyVerifiedError } from './domain/errors/email-already-verified-error'
import { EmailNotVerifiedError } from './domain/errors/email-not-verified-error'
import { InvalidCredentialsError } from './domain/errors/invalid-credentials-error'
import { InvalidCurrentPasswordError } from './domain/errors/invalid-current-password-error'
import { InvalidEmailVerificationTokenError } from './domain/errors/invalid-email-verification-token-error'
import { InvalidPasswordResetTokenError } from './domain/errors/invalid-password-reset-token-error'
import { NotAllowedToDownloadProjectError } from './domain/errors/not-allowed-to-download-project-error'
import { NotAllowedToRemoveProjectError } from './domain/errors/not-allowed-to-remove-project-error'
import { NotAllowedToShareProjectError } from './domain/errors/not-allowed-to-share-project-error'
import { ProjectDoesNotExistError } from './domain/errors/project-does-not-exist-error'
import { SessionDoesNotExistsError } from './domain/errors/session-does-not-exists-error'
import { UserAlreadyExistsError } from './domain/errors/user-already-exists-error'
import { UserDoesNotExistsError } from './domain/errors/user-does-not-exists-error'
import { CannotShareProjectWithYourselfError } from './domain/errors/cannot-share-project-with-yourself-error'

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
  [NotAllowedToShareProjectError, 'FORBIDDEN'],
  [NotAllowedToDownloadProjectError, 'FORBIDDEN'],
  [CannotShareProjectWithYourselfError, 'BAD_REQUEST'],
]

export function handleError(error: unknown): never {
  for (const [ErrorClass, code] of ERROR_MAP) {
    if (error instanceof ErrorClass) {
      throw new TRPCError({ code, message: error.message })
    }
  }
  throw error
}
