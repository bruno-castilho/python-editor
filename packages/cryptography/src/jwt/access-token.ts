import {
  type JWTPayloadDTO,
  jwtPayloadSchema,
} from '@python-editor/schemas/jwt-payload'
import type { JWT } from '../interfaces/jwt'
import { env } from '@python-editor/env/server'
import jwt from 'jsonwebtoken'

export class AccessToken implements JWT {
  constructor(private secret: string = env.ACCESS_TOKEN_SECRET) {}

  sign(payload: JWTPayloadDTO): string {
    return jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
      expiresIn: '1h',
    })
  }

  verify(token: string): JWTPayloadDTO {
    const paylaod = jwt.verify(token, this.secret) as JWTPayloadDTO
    return jwtPayloadSchema.parse(paylaod)
  }
}
