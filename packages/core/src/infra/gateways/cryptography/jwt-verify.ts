import { env } from '@python-editor/env/server'
import jwt from 'jsonwebtoken'
import {
  jwtPayloadSchema,
  type JWTPayloadDTO,
} from '@python-editor/schemas/jwt-payload'
import type { IJWTVerify } from '../../../domain/interfaces/cryptography/jwt-verify'

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
    const secret = env.REFRESH_TOKEN_SECRET
    super(secret, 'HS256')
  }

  protected parse(payload: unknown) {
    return jwtPayloadSchema.parse(payload)
  }
}
