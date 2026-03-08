import type { IJWT } from '../../src/cryptography/interfaces/jwt'
import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'

export class FakeJWT implements IJWT {
  sign(payload: JWTPayloadDTO): string {
    return JSON.stringify(payload)
  }

  verify(token: string): JWTPayloadDTO {
    return JSON.parse(token) as JWTPayloadDTO
  }
}
