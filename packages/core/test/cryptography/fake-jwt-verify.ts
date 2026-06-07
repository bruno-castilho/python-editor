import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'
import type { IJWTVerify } from '../../src/domain/interfaces/cryptography/jwt-verify'

export class FakeJWTVerify implements IJWTVerify<JWTPayloadDTO> {
  verifyAndParse(token: string) {
    return JSON.parse(token) as JWTPayloadDTO
  }
}
