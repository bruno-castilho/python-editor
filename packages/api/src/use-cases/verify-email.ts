import type { VerifyEmailDTO } from '@python-editor/schemas/verify-email'
import type { IEmailVerificationTokenKeyValueStore } from '../key-value-stores/interfaces/email-verification-token-key-value-store'
import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import { InvalidEmailVerificationTokenError } from './errors/invalid-email-verification-token-error'
import type { IHashGenerator } from '../cryptography/interfaces/hash-generator'

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
