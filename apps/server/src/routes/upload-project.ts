import { makeUploadProjectUseCase } from '@python-editor/api/use-cases/factories/make-upload-project'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function uploadProject(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = request.session
  const { buffer, filename, contentType } = request.uploadedProjectFile

  try {
    const useCase = makeUploadProjectUseCase()
    const { project } = await useCase.execute({
      userId,
      filename,
      fileBuffer: buffer,
      contentType,
    })
    return reply.send({ project, message: 'Project uploaded successfully.' })
  } catch {
    return reply.status(500).send({ message: 'Internal server error.' })
  }
}
