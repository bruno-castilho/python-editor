import db from '@python-editor/db'
import { ProjectsRepository } from '../../repositories/projects-repository'
import { FindSharedWithMeProjectsUseCase } from '../find-shared-with-me-projects'

export function makeFindSharedWithMeProjectsUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  return new FindSharedWithMeProjectsUseCase(projectsRepository)
}
