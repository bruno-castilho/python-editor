import type { ResendEmailVerificationDTO } from '@python-editor/schemas/resend-email-verification'
import type { IHasher } from '../cryptography/interfaces/hasher'
import type { IToken } from '../cryptography/interfaces/token'
import type { ISendEmailVerification } from '../emails/interfaces/send-email-verification'
import type { IEmailVerificationTokenKeyValueStore } from '../key-value-stores/interfaces/email-verification-token-key-value-store'
import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import { EmailAlreadyVerifiedError } from './errors/email-already-verified-error'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

interface ResendEmailVerificationUseCaseParams {
  dto: ResendEmailVerificationDTO
}

export class ResendEmailVerificationUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private emailVerificationToken: IToken,
    private emailVerificationTokenHasher: IHasher,
    private emailVerificationTokenKeyValueStore: IEmailVerificationTokenKeyValueStore,
    private sendEmailVerification: ISendEmailVerification,
  ) {}

  async execute({ dto }: ResendEmailVerificationUseCaseParams) {
    const { email } = dto

    const user = await this.usersRepository.findByEmail({ email })

    if (!user) {
      throw new InvalidCredentialsError()
    }

    if (user.emailVerified) {
      throw new EmailAlreadyVerifiedError()
    }

    const token = this.emailVerificationToken.generate()

    await this.saveEncryptedVerificationToken({ userId: user.id, token })

    await this.sendEmailVerification.send({ email, token })
  }

  private async saveEncryptedVerificationToken(params: {
    userId: string
    token: string
  }) {
    const { userId, token } = params
    const hashedToken = await this.emailVerificationTokenHasher.hash(token)
    return await this.emailVerificationTokenKeyValueStore.save({
      hashedToken,
      userId,
    })
  }
}
