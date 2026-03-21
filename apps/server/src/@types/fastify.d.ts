import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    session: { userId: string; sessionId: string }
    uploadedFile: {
      buffer: Buffer
      contentType: string
    }
  }
}
