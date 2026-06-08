import { RevokeUserSessionUseCase } from '../../domain/use-cases/revoke-user-session'
import { UserSessionsKeyValueStore } from '../gateways/valkey/user-sessions-key-value-store'

export function makeRevokeUserSessionUseCase() {
  const userSessionsKeyValueStore = new UserSessionsKeyValueStore()
  return new RevokeUserSessionUseCase(userSessionsKeyValueStore)
}
