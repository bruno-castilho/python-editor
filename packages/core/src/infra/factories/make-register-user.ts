import db from '@python-editor/db'
import { RegisterUserUseCase } from '../../domain/use-cases/register-user'
import { UsersRepository } from '../gateways/repositories/users-repository'
import {
  EmailVerificationTokenHashGenerator,
  PasswordHashGenerator,
} from '../gateways/cryptography/hash-generator'
import { EmailVerificationTokenGenerator } from '../gateways/cryptography/token-generator'
import { EmailVerificationTokenKeyValueStore } from '../gateways/valkey/email-verification-token-key-value-store'
import { SendEmailVerification } from '../gateways/email/send-email'

export function makeRegisterUserUseCase() {
  const usersRepository = new UsersRepository(db.prisma)
  const passwordHashGenerator = new PasswordHashGenerator()
  const emailVerificationTokenGenerator = new EmailVerificationTokenGenerator()
  const emailVerificationTokenGeneratorHasher =
    new EmailVerificationTokenHashGenerator()
  const emailVerificationTokenKeyValueStore =
    new EmailVerificationTokenKeyValueStore()
  const sendEmailVerification = new SendEmailVerification()

  return new RegisterUserUseCase(
    usersRepository,
    passwordHashGenerator,
    emailVerificationTokenGenerator,
    emailVerificationTokenGeneratorHasher,
    emailVerificationTokenKeyValueStore,
    sendEmailVerification,
  )
}
