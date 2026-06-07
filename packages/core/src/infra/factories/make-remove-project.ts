import db from '@python-editor/db'
import { ProjectStorage } from '../gateways/storages/storage'
import { RemoveProjectUseCase } from '../../domain/use-cases/remove-project'
import { ProjectsRepository } from '../gateways/repositories/projects-repository'

export function makeRemoveProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const projectStorage = new ProjectStorage()
  return new RemoveProjectUseCase(projectsRepository, projectStorage)
}
