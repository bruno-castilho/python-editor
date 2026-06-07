import { CannotShareProjectWithYourselfError } from '@python-editor/core/domain/errors/cannot-share-project-with-yourself-error'
import { EmailAlreadyVerifiedError } from '@python-editor/core/domain/errors/email-already-verified-error'
import { EmailNotVerifiedError } from '@python-editor/core/domain/errors/email-not-verified-error'
import { InvalidCredentialsError } from '@python-editor/core/domain/errors/invalid-credentials-error'
import { InvalidCurrentPasswordError } from '@python-editor/core/domain/errors/invalid-current-password-error'
import { InvalidEmailVerificationTokenError } from '@python-editor/core/domain/errors/invalid-email-verification-token-error'
import { InvalidPasswordResetTokenError } from '@python-editor/core/domain/errors/invalid-password-reset-token-error'
import { NotAllowedToDownloadProjectError } from '@python-editor/core/domain/errors/not-allowed-to-download-project-error'
import { NotAllowedToRemoveProjectError } from '@python-editor/core/domain/errors/not-allowed-to-remove-project-error'
import { NotAllowedToShareProjectError } from '@python-editor/core/domain/errors/not-allowed-to-share-project-error'
import { ProjectDoesNotExistError } from '@python-editor/core/domain/errors/project-does-not-exist-error'
import { SessionDoesNotExistsError } from '@python-editor/core/domain/errors/session-does-not-exists-error'
import { UserAlreadyExistsError } from '@python-editor/core/domain/errors/user-already-exists-error'
import { UserDoesNotExistsError } from '@python-editor/core/domain/errors/user-does-not-exists-error'
import { TRPCError } from '@trpc/server'
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'

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
