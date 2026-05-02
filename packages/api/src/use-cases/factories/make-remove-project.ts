import db from '@python-editor/db'
import { ProjectsRepository } from '../../repositories/projects-repository'
import { ProjectStorage } from '../../storages/storage'
import { RemoveProjectUseCase } from '../remove-project'

export function makeRemoveProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const projectStorage = new ProjectStorage()
  return new RemoveProjectUseCase(projectsRepository, projectStorage)
}
