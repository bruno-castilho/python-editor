import { SignOutUseCase } from '../../domain/use-cases/sign-out'
import { RefreshTokenVerify } from '../gateways/cryptography/jwt-verify'
import { UserSessionsKeyValueStore } from '../gateways/valkey/user-sessions-key-value-store'

export function makeSignOutUseCase() {
  const refreshTokenVerify = new RefreshTokenVerify()
  const userSessionsKeyValueStore = new UserSessionsKeyValueStore()
  return new SignOutUseCase(refreshTokenVerify, userSessionsKeyValueStore)
}
