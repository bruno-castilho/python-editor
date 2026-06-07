import type { ResetPasswordDTO } from '@python-editor/schemas/reset-password'
import type { IUsersRepository } from '../interfaces/repositories/users-repository'
import { InvalidPasswordResetTokenError } from '../errors/invalid-password-reset-token-error'
import type { IHashGenerator } from '../interfaces/cryptography/hash-generator'
import type { IPasswordResetTokenKeyValueStore } from '../interfaces/valkey/password-reset-token-key-value-store'

interface ResetPasswordParams {
  dto: ResetPasswordDTO
}

export class ResetPasswordUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordHashGenerator: IHashGenerator,
    private passwordResetTokenHashGenerator: IHashGenerator,
    private passwordResetTokenKeyValueStore: IPasswordResetTokenKeyValueStore,
  ) {}

  async execute({ dto }: ResetPasswordParams) {
    const { token, password } = dto

    const hashedToken = await this.passwordResetTokenHashGenerator.hash(token)

    const userId = await this.passwordResetTokenKeyValueStore.findUserIdByToken(
      {
        hashedToken,
      },
    )

    if (!userId) {
      throw new InvalidPasswordResetTokenError()
    }

    const hashedPassword = await this.passwordHashGenerator.hash(password)

    await this.usersRepository.updatePassword({ userId, hashedPassword })
    await this.passwordResetTokenKeyValueStore.delete({ hashedToken })
  }
}
