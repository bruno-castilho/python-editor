import type { IJWTVerify } from '../cryptography/interfaces/jwt-verify'
import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'
import type { IUserSessionsKeyValueStore } from '../key-value-stores/interfaces/user-sessions-key-value-store'

interface SignOutUseCaseParams {
  refreshToken: string
}

export class SignOutUseCase {
  constructor(
    private refreshTokenVerify: IJWTVerify<JWTPayloadDTO>,
    private userSessionsKeyValueStore: IUserSessionsKeyValueStore,
  ) {}

  async execute({ refreshToken }: SignOutUseCaseParams) {
    const { sessionId, userId } =
      this.refreshTokenVerify.verifyAndParse(refreshToken)

    await this.userSessionsKeyValueStore.delete(sessionId, userId)
  }
}
