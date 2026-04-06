import { ProjectsRepository } from '../../repositories/projects-repository'
import { FindPersonalProjectsUseCase } from '../find-personal-projects'

export function makeFindPersonalProjectsUseCase() {
  const projectsRepository = new ProjectsRepository()
  return new FindPersonalProjectsUseCase(projectsRepository)
}
