import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'
import type { Error } from '../../src/cryptography/interfaces/jwt-verify'

export class FakeJWTVerify implements Error<JWTPayloadDTO> {
  verifyAndParse(token: string) {
    return JSON.parse(token) as JWTPayloadDTO
  }
}
