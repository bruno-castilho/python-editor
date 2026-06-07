import db from '@python-editor/db'
import { FindSharedWithMeProjectsUseCase } from '../../domain/use-cases/find-shared-with-me-projects'
import { ProjectsRepository } from '../gateways/repositories/projects-repository'

export function makeFindSharedWithMeProjectsUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  return new FindSharedWithMeProjectsUseCase(projectsRepository)
}
