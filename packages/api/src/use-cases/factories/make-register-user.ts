import { EmailVerificationTokenHasher } from '../../cryptography/hasher/email-verification-token-hasher'
import { PasswordHasher } from '../../cryptography/hasher/password-hasher'
import { EmailVerificationToken } from '../../cryptography/token/email-verification-token'
import { SendEmailVerification } from '../../emails/send-email-verification'
import { EmailVerificationTokenKeyValueStore } from '../../key-value-stores/email-verification-token-key-value-store'
import { UsersRepository } from '../../repositories/users-repository'
import { RegisterUserUseCase } from '../register-user'

export function makeRegisterUserUseCase() {
  const usersRepository = new UsersRepository()
  const passwordHasher = new PasswordHasher()
  const emailVerificationToken = new EmailVerificationToken()
  const emailVerificationTokenHasher = new EmailVerificationTokenHasher()
  const emailVerificationTokenKeyValueStore =
    new EmailVerificationTokenKeyValueStore()
  const sendEmailVerification = new SendEmailVerification()

  return new RegisterUserUseCase(
    usersRepository,
    passwordHasher,
    emailVerificationToken,
    emailVerificationTokenHasher,
    emailVerificationTokenKeyValueStore,
    sendEmailVerification,
  )
}
