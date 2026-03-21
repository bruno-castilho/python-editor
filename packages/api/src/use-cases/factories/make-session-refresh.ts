import { AccessTokenSign, RefreshTokenSign } from '../../cryptography/jwt-sign'
import { RefreshTokenVerify } from '../../cryptography/jwt-verify'
import { UserSessionsKeyValueStore } from '../../key-value-stores/user-sessions-key-value-store'
import { SessionRefreshUseCase } from '../session-refresh'

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
