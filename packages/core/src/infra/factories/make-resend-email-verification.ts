import db from '@python-editor/db'
import { ResendEmailVerificationUseCase } from '../../domain/use-cases/resend-email-verification'
import { SendEmailVerification } from '../gateways/mail/send-email-verification'
import { UsersRepository } from '../gateways/repositories/users-repository'
import { EmailVerificationTokenGenerator } from '../gateways/cryptography/token-generator'
import { EmailVerificationTokenHashGenerator } from '../gateways/cryptography/hash-generator'
import { EmailVerificationTokenKeyValueStore } from '../gateways/valkey/email-verification-token-key-value-store'

export function makeResendEmailVerificationUseCase() {
  const usersRepository = new UsersRepository(db.prisma)
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
