import { NotAllowedToDownloadProjectError } from '@python-editor/api/use-cases/errors/not-allowed-to-download-project-error'
import { ProjectDoesNotExistError } from '@python-editor/api/use-cases/errors/project-does-not-exist-error'
import { makeDownloadProjectUseCase } from '@python-editor/api/use-cases/factories/make-download-project'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function downloadProject(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = request.session
  const { projectId } = request.params as { projectId: string }

  try {
    const useCase = makeDownloadProjectUseCase()
    const { data, projectName } = await useCase.execute({
      dto: { projectId },
      userId,
    })
    return reply
      .header('Content-Type', 'application/zip')
      .header(
        'Content-Disposition',
        `attachment; filename="${projectName}.zip"`,
      )
      .send(data)
  } catch (error) {
    if (error instanceof ProjectDoesNotExistError)
      return reply.status(404).send({ message: error.message })
    if (error instanceof NotAllowedToDownloadProjectError)
      return reply.status(403).send({ message: error.message })
    return reply.status(500).send({ message: 'Internal server error.' })
  }
}
