import type { SignInDTO } from '@python-editor/schemas/sign-in'
import type { IUsersRepository } from '../interfaces/repositories/users-repository'
import type { IHashCompare } from '../interfaces/cryptography/hash-compare'
import type { IJWTSign } from '../interfaces/cryptography/jwt-sign'
import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'
import type { IUserSessionsKeyValueStore } from '../interfaces/valkey/user-sessions-key-value-store'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { EmailNotVerifiedError } from '../errors/email-not-verified-error'

interface SignInUseCaseParams {
  dto: SignInDTO
  sessionInfo: {
    ip: string
    device: string
    browser: string
    location: string
  }
}

export class SignInUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private accessTokenSign: IJWTSign<JWTPayloadDTO>,
    private refreshTokenSign: IJWTSign<JWTPayloadDTO>,
    private passwordHashCompare: IHashCompare,
    private userSessionsKeyValueStore: IUserSessionsKeyValueStore,
  ) {}

  async execute({ dto, sessionInfo }: SignInUseCaseParams) {
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

    const sessionId = await this.userSessionsKeyValueStore.save({
      userId: user.id,
      ip: sessionInfo.ip,
      device: sessionInfo.device,
      browser: sessionInfo.browser,
      location: sessionInfo.location,
      lastAccess: new Date().toISOString(),
    })

    const payload: JWTPayloadDTO = { sessionId, userId: user.id }

    const accessToken = this.accessTokenSign.sign(payload)
    const refreshToken = this.refreshTokenSign.sign(payload)

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    }
  }
}
