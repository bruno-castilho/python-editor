import { UserSessionsKeyValueStore } from '../../key-value-stores/user-sessions-key-value-store'
import { RevokeUserSessionUseCase } from '../revoke-user-session'

export function makeRevokeUserSessionUseCase() {
  const userSessionsKeyValueStore = new UserSessionsKeyValueStore()
  return new RevokeUserSessionUseCase(userSessionsKeyValueStore)
}
