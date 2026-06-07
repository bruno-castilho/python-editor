import { GetUserSessionsUseCase } from '../../domain/use-cases/get-user-sessions'
import { UserSessionsKeyValueStore } from '../gateways/valkey/user-sessions-key-value-store'

export function makeGetUserSessionsUseCase() {
  const userSessionsKeyValueStore = new UserSessionsKeyValueStore()
  return new GetUserSessionsUseCase(userSessionsKeyValueStore)
}
