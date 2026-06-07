import type { VerifyEmailDTO } from '@python-editor/schemas/verify-email'
import type { IEmailVerificationTokenKeyValueStore } from '../interfaces/valkey/email-verification-token-key-value-store'
import type { IUsersRepository } from '../interfaces/repositories/users-repository'
import { InvalidEmailVerificationTokenError } from '../errors/invalid-email-verification-token-error'
import type { IHashGenerator } from '../interfaces/cryptography/hash-generator'

interface VerifyEmailUseCaseParams {
  dto: VerifyEmailDTO
}

export class VerifyEmailUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private emailVerificationTokenHashGenerator: IHashGenerator,
    private emailVerificationTokenKeyValueStore: IEmailVerificationTokenKeyValueStore,
  ) {}

  async execute({ dto }: VerifyEmailUseCaseParams) {
    const { token } = dto
    const hashedToken =
      await this.emailVerificationTokenHashGenerator.hash(token)

    const userId =
      await this.emailVerificationTokenKeyValueStore.findUserIdByToken({
        hashedToken,
      })

    if (!userId) {
      throw new InvalidEmailVerificationTokenError()
    }

    await this.usersRepository.markEmailAsVerified({ userId })
    await this.emailVerificationTokenKeyValueStore.delete({
      hashedToken,
    })
  }
}
