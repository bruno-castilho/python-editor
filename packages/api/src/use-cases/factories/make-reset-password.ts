import { PasswordHasher } from '../../cryptography/hasher/password-hasher'
import { PasswordResetTokenHasher } from '../../cryptography/hasher/password-reset-token-hasher'
import { PasswordResetTokenKeyValueStore } from '../../key-value-stores/password-reset-token-key-value-store'
import { UsersRepository } from '../../repositories/users-repository'
import { ResetPasswordUseCase } from '../reset-password'

export function makeResetPasswordUseCase() {
  const usersRepository = new UsersRepository()
  const passwordHasher = new PasswordHasher()
  const passwordResetTokenHasher = new PasswordResetTokenHasher()
  const passwordResetTokenKeyValueStore = new PasswordResetTokenKeyValueStore()

  return new ResetPasswordUseCase(
    usersRepository,
    passwordHasher,
    passwordResetTokenHasher,
    passwordResetTokenKeyValueStore,
  )
}
