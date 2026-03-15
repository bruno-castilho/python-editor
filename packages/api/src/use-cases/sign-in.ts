import type { SignInDTO } from '@python-editor/schemas/sign-in'
import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import type { IHashCompare } from '../cryptography/interfaces/hash-compare'
import type { IJWTSign } from '../cryptography/interfaces/jwt-sign'
import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { EmailNotVerifiedError } from './errors/email-not-verified-error'

interface SignInUseCaseParams {
  dto: SignInDTO
}

export class SignInUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private accessTokenSign: IJWTSign<JWTPayloadDTO>,
    private refreshTokenSign: IJWTSign<JWTPayloadDTO>,
    private passwordHashCompare: IHashCompare,
  ) {}

  async execute({ dto }: SignInUseCaseParams) {
    const { email, password } = dto

    const user = await this.usersRepository.findByEmailWithPassword({
      email,
    })

    if (!user) throw new InvalidCredentialsError()

    const { hashedPassword, ...userWithoutPassword } = user

    const doesPasswordMatches = await this.passwordHashCompare.compare(
      password,
      hashedPassword ?? '',
    )

    if (!doesPasswordMatches) throw new InvalidCredentialsError()

    if (!user.emailVerified) throw new EmailNotVerifiedError()

    const payload = { userId: user.id }

    const accessToken = this.accessTokenSign.sign(payload)
    const refreshToken = this.refreshTokenSign.sign(payload)

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    }
  }
}
