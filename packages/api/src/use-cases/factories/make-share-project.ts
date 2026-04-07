import { ProjectsRepository } from '../../repositories/projects-repository'
import { UsersRepository } from '../../repositories/users-repository'
import { ShareProjectUseCase } from '../share-project'

export function makeShareProjectUseCase() {
  const projectsRepository = new ProjectsRepository()
  const usersRepository = new UsersRepository()
  return new ShareProjectUseCase(projectsRepository, usersRepository)
}
