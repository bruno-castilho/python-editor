import db from '@python-editor/db'
import { ShareProjectUseCase } from '../../domain/use-cases/share-project'
import { env } from '@python-editor/env/server'
import { ProjectsRepository } from '../gateways/repositories/projects-repository'
import { UsersRepository } from '../gateways/repositories/users-repository'

export function makeShareProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const usersRepository = new UsersRepository(db.prisma)
  return new ShareProjectUseCase(
    `${env.APP_BASE_URL}/download-avatar`,
    projectsRepository,
    usersRepository,
  )
}
