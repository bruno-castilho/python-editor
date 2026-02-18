import type { JWT } from '@python-editor/cryptography/interfaces/jwt'
import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'

export class FakeJWT implements JWT {
  sign(payload: JWTPayloadDTO): string {
    return JSON.stringify(payload)
  }

  verify(token: string): JWTPayloadDTO {
    return JSON.parse(token) as JWTPayloadDTO
  }
}
