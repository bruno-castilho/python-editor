import db from '@python-editor/db'
import { UnshareProjectUseCase } from '../../domain/use-cases/unshare-project'
import { ProjectsRepository } from '../gateways/repositories/projects-repository'
import { UsersRepository } from '../gateways/repositories/users-repository'

export function makeUnshareProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const usersRepository = new UsersRepository(db.prisma)
  return new UnshareProjectUseCase(projectsRepository, usersRepository)
}
