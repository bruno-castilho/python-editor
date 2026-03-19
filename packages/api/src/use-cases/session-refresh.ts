import type { IJWTVerify } from '../cryptography/interfaces/jwt-verify'
import type { IJWTSign } from '../cryptography/interfaces/jwt-sign'
import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'

interface SessionRefreshUseCaseParams {
  refreshToken: string
}

export class SessionRefreshUseCase {
  constructor(
    private refreshTokenVerify: IJWTVerify<JWTPayloadDTO>,
    private accessTokenSign: IJWTSign<JWTPayloadDTO>,
    private refreshTokenSign: IJWTSign<JWTPayloadDTO>,
  ) {}

  async execute({ refreshToken }: SessionRefreshUseCaseParams) {
    const payload = this.refreshTokenVerify.verifyAndParse(refreshToken)

    const newAccessToken = this.accessTokenSign.sign({ userId: payload.userId })
    const newRefreshToken = this.refreshTokenSign.sign({
      userId: payload.userId,
    })

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }
}
