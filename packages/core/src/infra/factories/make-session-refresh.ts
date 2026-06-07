import { SessionRefreshUseCase } from '../../domain/use-cases/session-refresh'
import {
  AccessTokenSign,
  RefreshTokenSign,
} from '../gateways/cryptography/jwt-sign'
import { RefreshTokenVerify } from '../gateways/cryptography/jwt-verify'
import { UserSessionsKeyValueStore } from '../gateways/valkey/user-sessions-key-value-store'

export function makeSessionRefreshUseCase() {
  const refreshTokenVerify = new RefreshTokenVerify()
  const accessTokenSign = new AccessTokenSign()
  const refreshTokenSign = new RefreshTokenSign()
  const userSessionsKeyValueStore = new UserSessionsKeyValueStore()

  return new SessionRefreshUseCase(
    refreshTokenVerify,
    accessTokenSign,
    refreshTokenSign,
    userSessionsKeyValueStore,
  )
}
