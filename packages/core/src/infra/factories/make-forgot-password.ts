import db from '@python-editor/db'
import { UsersRepository } from '../gateways/repositories/users-repository'
import { PasswordResetTokenGenerator } from '../gateways/cryptography/token-generator'
import { PasswordResetTokenHashGenerator } from '../gateways/cryptography/hash-generator'
import { PasswordResetTokenKeyValueStore } from '../gateways/valkey/password-reset-token-key-value-store'
import { ForgotPasswordUseCase } from '../../domain/use-cases/forgot-password'
import { SendPasswordReset } from '../gateways/mail/send-email'

export function makeForgotPasswordUseCase() {
  const usersRepository = new UsersRepository(db.prisma)
  const passwordResetTokenGenerator = new PasswordResetTokenGenerator()
  const passwordResetTokenHashGenerator = new PasswordResetTokenHashGenerator()

  const passwordResetTokenKeyValueStore = new PasswordResetTokenKeyValueStore()
  const sendPasswordReset = new SendPasswordReset()

  return new ForgotPasswordUseCase(
    usersRepository,
    passwordResetTokenGenerator,
    passwordResetTokenHashGenerator,
    passwordResetTokenKeyValueStore,
    sendPasswordReset,
  )
}
