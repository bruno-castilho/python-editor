import { RefreshTokenVerify } from '../../cryptography/jwt-verify'
import { UserSessionsKeyValueStore } from '../../key-value-stores/user-sessions-key-value-store'
import { SignOutUseCase } from '../sign-out'

export function makeSignOutUseCase() {
  const refreshTokenVerify = new RefreshTokenVerify()
  const userSessionsKeyValueStore = new UserSessionsKeyValueStore()
  return new SignOutUseCase(refreshTokenVerify, userSessionsKeyValueStore)
}
