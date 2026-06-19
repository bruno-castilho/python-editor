import type { ResendEmailVerificationDTO } from '@python-editor/schemas/resend-email-verification'
import type { ITokenGenerator } from '../interfaces/cryptography/token-generator'
import type { ISendEmailVerification } from '../interfaces/email/send-email-verification'
import type { IUsersRepository } from '../interfaces/repositories/users-repository'
import type { IHashGenerator } from '../interfaces/cryptography/hash-generator'
import type { IEmailVerificationTokenKeyValueStore } from '../interfaces/valkey/email-verification-token-key-value-store'
import { EmailAlreadyVerifiedError } from '../errors/email-already-verified-error'
import { UserDoesNotExistsError } from '../errors/user-does-not-exists-error'

interface ResendEmailVerificationUseCaseParams {
  dto: ResendEmailVerificationDTO
}

export class ResendEmailVerificationUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private emailVerificationTokenGenerator: ITokenGenerator,
    private emailVerificationTokenHashGenerator: IHashGenerator,
    private emailVerificationTokenKeyValueStore: IEmailVerificationTokenKeyValueStore,
    private sendEmailVerification: ISendEmailVerification,
  ) {}

  async execute({ dto }: ResendEmailVerificationUseCaseParams) {
    const { email } = dto

    const user = await this.usersRepository.findByEmail({ email })

    if (!user) {
      throw new UserDoesNotExistsError()
    }

    if (user.emailVerified) {
      throw new EmailAlreadyVerifiedError()
    }

    const token = this.emailVerificationTokenGenerator.generate()

    await this.saveEncryptedVerificationToken({ userId: user.id, token })

    await this.sendEmailVerification.send({ email, token })
  }

  private async saveEncryptedVerificationToken(params: {
    userId: string
    token: string
  }) {
    const { userId, token } = params
    const hashedToken =
      await this.emailVerificationTokenHashGenerator.hash(token)
    return await this.emailVerificationTokenKeyValueStore.save({
      hashedToken,
      userId,
    })
  }
}
