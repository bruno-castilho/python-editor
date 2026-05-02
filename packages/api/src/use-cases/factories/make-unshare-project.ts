import db from '@python-editor/db'
import { ProjectsRepository } from '../../repositories/projects-repository'
import { UsersRepository } from '../../repositories/users-repository'
import { UnshareProjectUseCase } from '../unshare-project'

export function makeUnshareProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const usersRepository = new UsersRepository(db.prisma)
  return new UnshareProjectUseCase(projectsRepository, usersRepository)
}
