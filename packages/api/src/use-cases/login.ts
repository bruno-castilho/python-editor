import type { LoginDTO } from '@python-editor/schemas/login'
import type { IJWT } from '../cryptography/interfaces/jwt'
import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import type { IHasher } from '../cryptography/interfaces/hasher'

import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { EmailNotVerifiedError } from './errors/email-not-verified-error'

export class LoginUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private accessToken: IJWT,
    private refreshToken: IJWT,
    private passwordHasher: IHasher,
  ) {}

  async execute(params: LoginDTO) {
    const { email, password } = params

    const user = await this.usersRepository.findByEmailWithPassword({
      email,
    })

    if (!user) throw new InvalidCredentialsError()

    const { hashedPassword, ...userWithoutPassword } = user

    const doesPasswordMatches = await this.passwordHasher.compare(
      password,
      hashedPassword ?? '',
    )

    if (!doesPasswordMatches) throw new InvalidCredentialsError()

    if (!user.emailVerified) throw new EmailNotVerifiedError()

    const payload = { userId: user.id }

    const accessToken = this.accessToken.sign(payload)
    const refreshToken = this.refreshToken.sign(payload)

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    }
  }
}
