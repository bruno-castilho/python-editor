import { PasswordResetToken } from '../../cryptography/token/password-reset-token'
import { PasswordResetTokenHasher } from '../../cryptography/hasher/password-reset-token-hasher'
import { PasswordResetTokenKeyValueStore } from '../../key-value-stores/password-reset-token-key-value-store'
import { UsersRepository } from '../../repositories/users-repository'
import { SendPasswordReset } from '../../emails/send-password-reset'
import { ForgotPasswordUseCase } from '../forgot-password'

export function makeForgotPasswordUseCase() {
  const usersRepository = new UsersRepository()
  const passwordResetToken = new PasswordResetToken()
  const passwordResetTokenHasher = new PasswordResetTokenHasher()
  const passwordResetTokenKeyValueStore = new PasswordResetTokenKeyValueStore()
  const sendPasswordReset = new SendPasswordReset()

  return new ForgotPasswordUseCase(
    usersRepository,
    passwordResetToken,
    passwordResetTokenHasher,
    passwordResetTokenKeyValueStore,
    sendPasswordReset,
  )
}
