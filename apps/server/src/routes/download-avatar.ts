import { makeDownloadAvatarUseCase } from '@python-editor/core/infra/factories/make-download-avatar'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function downloadAvatar(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { fileId } = request.params as { fileId: string }

  try {
    const useCase = makeDownloadAvatarUseCase()
    const { avatarData, contentType } = await useCase.execute({
      dto: { fileId },
    })
    return reply
      .header('Content-Type', contentType ?? 'application/octet-stream')
      .send(avatarData)
  } catch (_error) {
    return reply.status(500).send({ message: 'Internal server error.' })
  }
}
