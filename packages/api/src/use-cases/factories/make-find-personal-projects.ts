import db from '@python-editor/db'
import { ProjectsRepository } from '../../repositories/projects-repository'
import { FindPersonalProjectsUseCase } from '../find-personal-projects'

export function makeFindPersonalProjectsUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  return new FindPersonalProjectsUseCase(projectsRepository)
}
