import { ProjectsRepository } from '@python-editor/core/infra/gateways/repositories/projects-repository'
import db from '@python-editor/db'

export async function shareProject(params: {
  projectId: string
  userId: string
}) {
  const { projectId, userId } = params
  const projectsRepository = new ProjectsRepository(db.prisma)

  await projectsRepository.share({ projectId, userId })
}
