import {
  type JWTPayloadDTO,
  jwtPayloadSchema,
} from '@python-editor/schemas/jwt-payload'
import type { JWT } from '../interfaces/jwt'
import { env } from '@python-editor/env/server'
import jwt from 'jsonwebtoken'

export class RefreshToken implements JWT {
  private privateKey: string
  private publicKey: string

  constructor(
    privateKeyBase64: string = env.REFRESH_TOKEN_PRIVATE_KEY,
    publicKeyBase64: string = env.REFRESH_TOKEN_PUBLIC_KEY,
  ) {
    this.privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8')
    this.publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf-8')
  }

  sign(payload: JWTPayloadDTO): string {
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '7d',
    })
  }

  verify(token: string): JWTPayloadDTO {
    const paylaod = jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
    }) as JWTPayloadDTO
    return jwtPayloadSchema.parse(paylaod)
  }
}
