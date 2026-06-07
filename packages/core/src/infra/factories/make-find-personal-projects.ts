import db from '@python-editor/db'
import { FindPersonalProjectsUseCase } from '../../domain/use-cases/find-personal-projects'
import { env } from '@python-editor/env/server'
import { ProjectsRepository } from '../gateways/repositories/projects-repository'

export function makeFindPersonalProjectsUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  return new FindPersonalProjectsUseCase(
    `${env.APP_BASE_URL}/download-avatar`,
    projectsRepository,
  )
}
