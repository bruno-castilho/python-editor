import type { StringValue } from 'ms'
import jwt from 'jsonwebtoken'
import type { IJWTSign } from '../domain/interfaces/cryptography/jwt-sign'
import { env } from '@python-editor/env/server'
import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'

abstract class JWTSign<Payload> implements IJWTSign<Payload> {
  constructor(
    private key: string,
    private algorithm: 'HS256' | 'RS256',
    private expiresIn: StringValue | number,
  ) {}

  public sign(payload: Payload) {
    return jwt.sign(payload as object, this.key, {
      algorithm: this.algorithm,
      expiresIn: this.expiresIn,
    })
  }
}

export class AccessTokenSign extends JWTSign<JWTPayloadDTO> {
  constructor() {
    const secret = env.ACCESS_TOKEN_SECRET
    super(secret, 'HS256', '1h')
  }
}

export class RefreshTokenSign extends JWTSign<JWTPayloadDTO> {
  constructor() {
    const secret = env.REFRESH_TOKEN_SECRET
    super(secret, 'HS256', '7d')
  }
}
