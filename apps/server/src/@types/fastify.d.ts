import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    session: { userId: string; sessionId: string }
    uploadedAvatarFile: {
      buffer: Buffer
      contentType: string
    }
    uploadedProjectFile: {
      buffer: Buffer
      filename: string
      contentType: string
    }
  }
}
