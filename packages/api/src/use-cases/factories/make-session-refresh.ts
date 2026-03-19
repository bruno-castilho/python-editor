import { AccessTokenSign, RefreshTokenSign } from '../../cryptography/jwt-sign'
import { RefreshTokenVerify } from '../../cryptography/jwt-verify'
import { SessionRefreshUseCase } from '../session-refresh'

export function makeSessionRefreshUseCase() {
  const refreshTokenVerify = new RefreshTokenVerify()
  const accessTokenSign = new AccessTokenSign()
  const refreshTokenSign = new RefreshTokenSign()

  return new SessionRefreshUseCase(
    refreshTokenVerify,
    accessTokenSign,
    refreshTokenSign,
  )
}
