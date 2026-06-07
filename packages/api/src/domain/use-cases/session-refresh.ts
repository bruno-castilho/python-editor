import type { IJWTVerify } from '../interfaces/cryptography/jwt-verify'
import type { IJWTSign } from '../interfaces/cryptography/jwt-sign'
import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'
import type { IUserSessionsKeyValueStore } from '../interfaces/valkey/user-sessions-key-value-store'
import { SessionDoesNotExistsError } from '../errors/session-does-not-exists-error'

interface SessionRefreshUseCaseParams {
  refreshToken: string
}

export class SessionRefreshUseCase {
  constructor(
    private refreshTokenVerify: IJWTVerify<JWTPayloadDTO>,
    private accessTokenSign: IJWTSign<JWTPayloadDTO>,
    private refreshTokenSign: IJWTSign<JWTPayloadDTO>,
    private userSessionsKeyValueStore: IUserSessionsKeyValueStore,
  ) {}

  async execute({ refreshToken }: SessionRefreshUseCaseParams) {
    const { sessionId, userId } =
      this.refreshTokenVerify.verifyAndParse(refreshToken)

    const session =
      await this.userSessionsKeyValueStore.findBySessionId(sessionId)
    if (!session) {
      throw new SessionDoesNotExistsError()
    }

    await this.userSessionsKeyValueStore.update(sessionId)

    const newPayload: JWTPayloadDTO = {
      sessionId,
      userId,
    }

    const newAccessToken = this.accessTokenSign.sign(newPayload)
    const newRefreshToken = this.refreshTokenSign.sign(newPayload)

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }
}
