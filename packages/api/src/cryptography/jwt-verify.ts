import { env } from '@python-editor/env/server'
import type { IJWTVerify } from './interfaces/jwt-verify'
import jwt from 'jsonwebtoken'
import {
  jwtPayloadSchema,
  type JWTPayloadDTO,
} from '@python-editor/schemas/jwt-payload'

abstract class JWTVerify<Payload> implements IJWTVerify<Payload> {
  constructor(
    private key: string,
    private algorithm: 'HS256' | 'RS256',
  ) {}

  public verifyAndParse(token: string) {
    const payload = jwt.verify(token, this.key, {
      algorithms: [this.algorithm],
    })

    return this.parse(payload)
  }

  protected abstract parse(payload: unknown): Payload
}

export class AccessTokenVerify extends JWTVerify<JWTPayloadDTO> {
  constructor() {
    const secret = env.ACCESS_TOKEN_SECRET
    super(secret, 'HS256')
  }

  protected parse(payload: unknown) {
    return jwtPayloadSchema.parse(payload)
  }
}

export class RefreshTokenVerify extends JWTVerify<JWTPayloadDTO> {
  constructor() {
    const publicKeyBase64: string = env.REFRESH_TOKEN_PUBLIC_KEY
    const publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf-8')

    super(publicKey, 'RS256')
  }

  protected parse(payload: unknown) {
    return jwtPayloadSchema.parse(payload)
  }
}
