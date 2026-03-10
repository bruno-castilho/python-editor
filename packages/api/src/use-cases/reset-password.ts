import type { IHasher } from '../cryptography/interfaces/hasher'
import type { IPasswordResetTokenKeyValueStore } from '../key-value-stores/interfaces/password-reset-token-key-value-store'
import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import { InvalidPasswordResetTokenError } from './errors/invalid-password-reset-token-error'

interface ResetPasswordParams {
  token: string
  password: string
}

export class ResetPasswordUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordHasher: IHasher,
    private passwordResetTokenHasher: IHasher,
    private passwordResetTokenKeyValueStore: IPasswordResetTokenKeyValueStore,
  ) {}

  async execute(params: ResetPasswordParams) {
    const { token, password } = params

    const hashedToken = await this.passwordResetTokenHasher.hash(token)

    const userId = await this.passwordResetTokenKeyValueStore.findUserIdByToken(
      {
        hashedToken,
      },
    )

    if (!userId) {
      throw new InvalidPasswordResetTokenError()
    }

    const hashedPassword = await this.passwordHasher.hash(password)

    await this.usersRepository.updatePassword({ userId, hashedPassword })
    await this.passwordResetTokenKeyValueStore.delete({ hashedToken })
  }
}
