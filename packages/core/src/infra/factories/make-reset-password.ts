import db from '@python-editor/db'
import { ResetPasswordUseCase } from '../../domain/use-cases/reset-password'
import { UsersRepository } from '../gateways/repositories/users-repository'
import {
  PasswordHashGenerator,
  PasswordResetTokenHashGenerator,
} from '../gateways/cryptography/hash-generator'
import { PasswordResetTokenKeyValueStore } from '../gateways/valkey/password-reset-token-key-value-store'

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
