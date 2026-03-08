import { ResendEmailVerificationUseCase } from '../resend-email-verification'

import { EmailVerificationToken } from '../../cryptography/token/email-verification-token'
import { UsersRepository } from '../../repositories/users-repository'
import { EmailVerificationTokenHasher } from '../../cryptography/hasher/email-verification-token-hasher'
import { EmailVerificationTokenKeyValueStore } from '../../key-value-stores/email-verification-token-key-value-store'
import { SendEmailVerification } from '../../emails/send-email-verification'

export function makeResendEmailVerificationUseCase() {
  const usersRepository = new UsersRepository()
  const emailVerificationToken = new EmailVerificationToken()
  const emailVerificationTokenHasher = new EmailVerificationTokenHasher()
  const emailVerificationTokenKeyValueStore =
    new EmailVerificationTokenKeyValueStore()
  const sendEmailVerification = new SendEmailVerification()

  return new ResendEmailVerificationUseCase(
    usersRepository,
    emailVerificationToken,
    emailVerificationTokenHasher,
    emailVerificationTokenKeyValueStore,
    sendEmailVerification,
  )
}
