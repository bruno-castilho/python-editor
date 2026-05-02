import db from '@python-editor/db'
import { ProjectsRepository } from '../../repositories/projects-repository'
import { UsersRepository } from '../../repositories/users-repository'
import { ShareProjectUseCase } from '../share-project'

export function makeShareProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const usersRepository = new UsersRepository(db.prisma)
  return new ShareProjectUseCase(projectsRepository, usersRepository)
}
