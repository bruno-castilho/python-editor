import { NotAllowedToUpdateProjectError } from '@python-editor/core/domain/errors/not-allowed-to-update-project-error'
import { ProjectDoesNotExistError } from '@python-editor/core/domain/errors/project-does-not-exist-error'
import { makeUpdateProjectUseCase } from '@python-editor/core/infra/factories/make-update-project'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function updateProject(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = request.session
  const { projectId } = request.params as { projectId: string }
  const { buffer, contentType } = request.uploadedProjectFile

  try {
    const useCase = makeUpdateProjectUseCase()
    await useCase.execute({
      userId,
      dto: { projectId, fileBuffer: buffer, contentType },
    })
    return reply.send({ message: 'Project updated successfully.' })
  } catch (error) {
    if (error instanceof ProjectDoesNotExistError)
      return reply.status(404).send({ message: error.message })
    if (error instanceof NotAllowedToUpdateProjectError)
      return reply.status(403).send({ message: error.message })
    return reply.status(500).send({ message: 'Internal server error.' })
  }
}
