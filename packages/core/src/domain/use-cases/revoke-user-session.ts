import type { RevokeUserSessionDTO } from '@python-editor/schemas/revoke-user-session'
import type { IUserSessionsKeyValueStore } from '../interfaces/valkey/user-sessions-key-value-store'
import { SessionDoesNotExistsError } from '../errors/session-does-not-exists-error'

interface RevokeUserSessionUseCaseParams {
  dto: RevokeUserSessionDTO
  userId: string
}

export class RevokeUserSessionUseCase {
  constructor(private userSessionsKeyValueStore: IUserSessionsKeyValueStore) {}

  async execute({ dto, userId }: RevokeUserSessionUseCaseParams) {
    const { sessionId } = dto

    const session =
      await this.userSessionsKeyValueStore.findBySessionId(sessionId)

    if (!session || session.userId !== userId) {
      throw new SessionDoesNotExistsError()
    }

    await this.userSessionsKeyValueStore.delete(sessionId, userId)
  }
}
