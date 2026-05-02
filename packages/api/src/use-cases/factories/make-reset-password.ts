import db from '@python-editor/db'
import {
  PasswordHashGenerator,
  PasswordResetTokenHashGenerator,
} from '../../cryptography/hash-generator'
import { PasswordResetTokenKeyValueStore } from '../../key-value-stores/password-reset-token-key-value-store'
import { UsersRepository } from '../../repositories/users-repository'
import { ResetPasswordUseCase } from '../reset-password'

export function makeResetPasswordUseCase() {
  const usersRepository = new UsersRepository(db.prisma)
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
