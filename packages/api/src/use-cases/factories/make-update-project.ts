import db from '@python-editor/db'
import { ProjectsRepository } from '../../repositories/projects-repository'
import { ProjectStorage } from '../../storages/storage'
import { UpdateProjectUseCase } from '../update-project'

export function makeUpdateProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const projectStorage = new ProjectStorage()
  return new UpdateProjectUseCase(projectsRepository, projectStorage)
}
