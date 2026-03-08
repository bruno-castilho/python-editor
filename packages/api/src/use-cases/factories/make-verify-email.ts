import { EmailVerificationTokenHasher } from '../../cryptography/hasher/email-verification-token-hasher'
import { EmailVerificationTokenKeyValueStore } from '../../key-value-stores/email-verification-token-key-value-store'
import { UsersRepository } from '../../repositories/users-repository'
import { VerifyEmailUseCase } from '../verify-email'

export function makeVerifyEmailUseCase() {
  const usersRepository = new UsersRepository()
  const emailVerificationTokenHasher = new EmailVerificationTokenHasher()
  const emailVerificationTokenKeyValueStore =
    new EmailVerificationTokenKeyValueStore()

  return new VerifyEmailUseCase(
    usersRepository,
    emailVerificationTokenHasher,
    emailVerificationTokenKeyValueStore,
  )
}
