import { UserSessionsKeyValueStore } from '../../key-value-stores/user-sessions-key-value-store'
import { GetUserSessionsUseCase } from '../get-user-sessions'

export function makeGetUserSessionsUseCase() {
  const userSessionsKeyValueStore = new UserSessionsKeyValueStore()
  return new GetUserSessionsUseCase(userSessionsKeyValueStore)
}
