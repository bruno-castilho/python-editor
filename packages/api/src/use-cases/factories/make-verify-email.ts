import { EmailVerificationTokenHashGenerator } from '../../cryptography/hash-generator'
import { EmailVerificationTokenKeyValueStore } from '../../key-value-stores/email-verification-token-key-value-store'
import { UsersRepository } from '../../repositories/users-repository'
import { VerifyEmailUseCase } from '../verify-email'

export function makeVerifyEmailUseCase() {
  const usersRepository = new UsersRepository()
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
