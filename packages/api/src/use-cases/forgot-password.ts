import type { ForgotPasswordDTO } from '@python-editor/schemas/forgot-password'
import type { IHasher } from '../cryptography/interfaces/hasher'
import type { IToken } from '../cryptography/interfaces/token'
import type { ISendPasswordReset } from '../emails/interfaces/send-password-reset'
import type { IPasswordResetTokenKeyValueStore } from '../key-value-stores/interfaces/password-reset-token-key-value-store'
import type { IUsersRepository } from '../repositories/interfaces/users-repository'

interface ForgotPasswordUseCaseParams {
  dto: ForgotPasswordDTO
}

export class ForgotPasswordUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordResetToken: IToken,
    private passwordResetTokenHasher: IHasher,
    private passwordResetTokenKeyValueStore: IPasswordResetTokenKeyValueStore,
    private sendPasswordReset: ISendPasswordReset,
  ) {}

  async execute({ dto }: ForgotPasswordUseCaseParams) {
    const { email } = dto

    const user = await this.usersRepository.findByEmail({ email })

    if (!user) {
      return
    }

    const token = this.passwordResetToken.generate()

    await this.saveEncryptedPasswordResetToken({
      userId: user.id,
      token,
    })

    await this.sendPasswordReset.send({ email, token })
  }

  private async saveEncryptedPasswordResetToken(params: {
    userId: string
    token: string
  }) {
    const { userId, token } = params
    const hashedToken = await this.passwordResetTokenHasher.hash(token)
    await this.passwordResetTokenKeyValueStore.save({
      hashedToken,
      userId,
    })
  }
}
