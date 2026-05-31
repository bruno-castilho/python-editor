import db from '@python-editor/db'
import { ProjectsRepository } from '../../repositories/projects-repository'
import { UsersRepository } from '../../repositories/users-repository'
import { ShareProjectUseCase } from '../share-project'
import { env } from '@python-editor/env/server'

export function makeShareProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const usersRepository = new UsersRepository(db.prisma)
  return new ShareProjectUseCase(
    `${env.APP_BASE_URL}/download-avatar`,
    projectsRepository,
    usersRepository,
  )
}
