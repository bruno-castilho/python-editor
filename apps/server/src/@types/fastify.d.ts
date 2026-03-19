import type { JWTPayloadDTO } from '@python-editor/schemas/jwt-payload'

declare module 'fastify' {
  interface FastifyRequest {
    session: JWTPayloadDTO
    uploadedFile: {
      buffer: Buffer
      contentType: string
    }
  }
}
