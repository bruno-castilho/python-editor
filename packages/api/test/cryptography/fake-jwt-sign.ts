import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'
import type { IJWTSign } from '../../src/cryptography/interfaces/jwt-sign'

export class FakeJWTSign implements IJWTSign<JWTPayloadDTO> {
  sign(payload: JWTPayloadDTO) {
    return JSON.stringify(payload)
  }
}
