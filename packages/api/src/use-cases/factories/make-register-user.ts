import db from '@python-editor/db'
import {
  EmailVerificationTokenHashGenerator,
  PasswordHashGenerator,
} from '../../cryptography/hash-generator'
import { EmailVerificationTokenGenerator } from '../../cryptography/token-generator'
import { SendEmailVerification } from '../../emails/send-email-verification'
import { EmailVerificationTokenKeyValueStore } from '../../key-value-stores/email-verification-token-key-value-store'
import { UsersRepository } from '../../repositories/users-repository'
import { RegisterUserUseCase } from '../register-user'

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
