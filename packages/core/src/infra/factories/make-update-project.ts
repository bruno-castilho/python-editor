import db from '@python-editor/db'
import { ProjectStorage } from '../gateways/storages/storage'
import { UpdateProjectUseCase } from '../../domain/use-cases/update-project'
import { ProjectsRepository } from '../gateways/repositories/projects-repository'

export function makeUpdateProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const projectStorage = new ProjectStorage()
  return new UpdateProjectUseCase(projectsRepository, projectStorage)
}
