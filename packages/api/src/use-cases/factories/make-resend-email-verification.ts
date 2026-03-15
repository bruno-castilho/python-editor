import { ResendEmailVerificationUseCase } from '../resend-email-verification'

import { UsersRepository } from '../../repositories/users-repository'
import { EmailVerificationTokenKeyValueStore } from '../../key-value-stores/email-verification-token-key-value-store'
import { SendEmailVerification } from '../../emails/send-email-verification'
import { EmailVerificationTokenGenerator } from '../../cryptography/token-generator'
import { EmailVerificationTokenHashGenerator } from '../../cryptography/hash-generator'

export function makeResendEmailVerificationUseCase() {
  const usersRepository = new UsersRepository()
  const emailVerificationTokenGenerator = new EmailVerificationTokenGenerator()
  const emailVerificationTokenHashGenerator =
    new EmailVerificationTokenHashGenerator()
  const emailVerificationTokenKeyValueStore =
    new EmailVerificationTokenKeyValueStore()
  const sendEmailVerification = new SendEmailVerification()

  return new ResendEmailVerificationUseCase(
    usersRepository,
    emailVerificationTokenGenerator,
    emailVerificationTokenHashGenerator,
    emailVerificationTokenKeyValueStore,
    sendEmailVerification,
  )
}
