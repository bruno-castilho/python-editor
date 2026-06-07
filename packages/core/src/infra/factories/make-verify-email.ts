import db from '@python-editor/db'
import { VerifyEmailUseCase } from '../../domain/use-cases/verify-email'
import { UsersRepository } from '../gateways/repositories/users-repository'
import { EmailVerificationTokenHashGenerator } from '../gateways/cryptography/hash-generator'
import { EmailVerificationTokenKeyValueStore } from '../gateways/valkey/email-verification-token-key-value-store'

export function makeVerifyEmailUseCase() {
  const usersRepository = new UsersRepository(db.prisma)
  const emailVerificationTokenHashGenerator =
    new EmailVerificationTokenHashGenerator()
  const emailVerificationTokenKeyValueStore =
    new EmailVerificationTokenKeyValueStore()

  return new VerifyEmailUseCase(
    usersRepository,
    emailVerificationTokenHashGenerator,
    emailVerificationTokenKeyValueStore,
  )
}
