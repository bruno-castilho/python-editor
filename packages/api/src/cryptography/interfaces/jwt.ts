import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'

export interface IJWT {
  sign(payload: JWTPayloadDTO): string

  verify(token: string): JWTPayloadDTO
}
