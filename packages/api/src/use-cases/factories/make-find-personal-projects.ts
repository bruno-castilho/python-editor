import db from '@python-editor/db'
import { ProjectsRepository } from '../../repositories/projects-repository'
import { FindPersonalProjectsUseCase } from '../find-personal-projects'
import { env } from '@python-editor/env/server'

export function makeFindPersonalProjectsUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  return new FindPersonalProjectsUseCase(
    `${env.APP_BASE_URL}/download-avatar`,
    projectsRepository,
  )
}
