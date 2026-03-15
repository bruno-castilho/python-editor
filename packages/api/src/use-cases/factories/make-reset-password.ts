import {
  PasswordHashGenerator,
  PasswordResetTokenHashGenerator,
} from '../../cryptography/hash-generator'
import { PasswordResetTokenKeyValueStore } from '../../key-value-stores/password-reset-token-key-value-store'
import { UsersRepository } from '../../repositories/users-repository'
import { ResetPasswordUseCase } from '../reset-password'

export function makeResetPasswordUseCase() {
  const usersRepository = new UsersRepository()
  const passwordHashGenerator = new PasswordHashGenerator()
  const passwordResetTokenHashGenerator = new PasswordResetTokenHashGenerator()
  const passwordResetTokenKeyValueStore = new PasswordResetTokenKeyValueStore()

  return new ResetPasswordUseCase(
    usersRepository,
    passwordHashGenerator,
    passwordResetTokenHashGenerator,
    passwordResetTokenKeyValueStore,
  )
}
