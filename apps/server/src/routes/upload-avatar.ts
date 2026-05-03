import { makeUploadAvatar } from '@python-editor/api/use-cases/factories/make-upload-avatar'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function uploadAvatar(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = request.session
  const { buffer, contentType } = request.uploadedAvatarFile

  try {
    const useCase = makeUploadAvatar()
    const { avatarUrl } = await useCase.execute({
      userId,
      fileBuffer: buffer,
      contentType,
    })
    return reply.send({ avatarUrl, message: 'Avatar uploaded successfully.' })
  } catch {
    return reply.status(500).send({ message: 'Internal server error.' })
  }
}
