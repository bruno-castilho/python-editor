import { ProjectsRepository } from '../../repositories/projects-repository'
import { UsersRepository } from '../../repositories/users-repository'
import { UnshareProjectUseCase } from '../unshare-project'

export function makeUnshareProjectUseCase() {
  const projectsRepository = new ProjectsRepository()
  const usersRepository = new UsersRepository()
  return new UnshareProjectUseCase(projectsRepository, usersRepository)
}
