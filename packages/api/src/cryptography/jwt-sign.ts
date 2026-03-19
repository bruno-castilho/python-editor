import type { StringValue } from 'ms'
import jwt from 'jsonwebtoken'
import type { IJWTSign } from './interfaces/jwt-sign'
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
    const pivateKeyBase64: string = env.REFRESH_TOKEN_PRIVATE_KEY
    const privateKey = Buffer.from(pivateKeyBase64, 'base64').toString('utf-8')

    super(privateKey, 'RS256', '7d')
  }
}
