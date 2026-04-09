import 'fastify'
import type { Readable } from 'node:stream'

declare module 'fastify' {
  interface FastifyRequest {
    session: { userId: string; sessionId: string }
    uploadedAvatarFile: {
      stream: Readable
      contentType: string
    }
    uploadedProjectFile: {
      stream: Readable
      filename: string
      contentType: string
    }
    uploadedProjectFileBuffer: {
      buffer: Buffer
      contentType: string
    }
  }
}
