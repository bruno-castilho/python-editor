import type { IUserSessionsKeyValueStore } from '../interfaces/valkey/user-sessions-key-value-store'

interface GetUserSessionsUseCaseParams {
  userId: string
}

export class GetUserSessionsUseCase {
  constructor(private userSessionsKeyValueStore: IUserSessionsKeyValueStore) {}

  async execute({ userId }: GetUserSessionsUseCaseParams) {
    const sessions =
      await this.userSessionsKeyValueStore.findAllByUserId(userId)
    return { sessions }
  }
}
