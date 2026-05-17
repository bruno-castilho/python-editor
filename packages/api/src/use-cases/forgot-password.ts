import type { ForgotPasswordDTO } from '@python-editor/schemas/forgot-password'
import type { ITokenGenerator } from '../cryptography/interfaces/token-generator'
import type { ISendPasswordReset } from '../emails/interfaces/send-password-reset'
import type { IPasswordResetTokenKeyValueStore } from '../key-value-stores/interfaces/password-reset-token-key-value-store'
import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import type { IHashGenerator } from '../cryptography/interfaces/hash-generator'

interface ForgotPasswordUseCaseParams {
  dto: ForgotPasswordDTO
}

export class ForgotPasswordUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordResetTokenGenerator: ITokenGenerator,
    private passwordResetTokenHashGenerator: IHashGenerator,
    private passwordResetTokenKeyValueStore: IPasswordResetTokenKeyValueStore,
    private sendPasswordReset: ISendPasswordReset,
  ) {}

  public async execute({ dto }: ForgotPasswordUseCaseParams) {
    const { email } = dto

    const user = await this.usersRepository.findByEmail({ email })

    if (!user) {
      return
    }

    const token = this.passwordResetTokenGenerator.generate()

    await this.saveEncryptedPasswordResetTokenGenerator({
      userId: user.id,
      token,
    })

    await this.sendPasswordReset.send({ email, token })
  }

  private async saveEncryptedPasswordResetTokenGenerator(params: {
    userId: string
    token: string
  }) {
    const { userId, token } = params
    const hashedToken = await this.passwordResetTokenHashGenerator.hash(token)
    await this.passwordResetTokenKeyValueStore.save({
      hashedToken,
      userId,
    })
  }
}
