import type { IUserSessionsKeyValueStore } from '../key-value-stores/interfaces/user-sessions-key-value-store'
import { SessionDoesNotExistsError } from './errors/session-does-not-exists-error'

interface RevokeUserSessionUseCaseParams {
  sessionId: string
  userId: string
}

export class RevokeUserSessionUseCase {
  constructor(private userSessionsKeyValueStore: IUserSessionsKeyValueStore) {}

  async execute({ sessionId, userId }: RevokeUserSessionUseCaseParams) {
    const session =
      await this.userSessionsKeyValueStore.findBySessionId(sessionId)

    if (!session || session.userId !== userId) {
      throw new SessionDoesNotExistsError()
    }

    await this.userSessionsKeyValueStore.delete(sessionId, userId)
  }
}
