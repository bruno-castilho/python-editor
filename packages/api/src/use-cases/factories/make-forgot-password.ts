import { PasswordResetTokenKeyValueStore } from '../../key-value-stores/password-reset-token-key-value-store'
import { UsersRepository } from '../../repositories/users-repository'
import { SendPasswordReset } from '../../emails/send-password-reset'
import { ForgotPasswordUseCase } from '../forgot-password'
import { PasswordResetTokenGenerator } from '../../cryptography/token-generator'
import { PasswordResetTokenHashGenerator } from '../../cryptography/hash-generator'

export function makeForgotPasswordUseCase() {
  const usersRepository = new UsersRepository()
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
