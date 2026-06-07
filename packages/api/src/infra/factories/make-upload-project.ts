import db from '@python-editor/db'
import { ProjectStorage } from '../gateways/storages/storage'
import { UploadProjectUseCase } from '../../domain/use-cases/upload-project'
import { ProjectsRepository } from '../gateways/repositories/projects-repository'

export function makeUploadProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const projectStorage = new ProjectStorage()
  return new UploadProjectUseCase(projectsRepository, projectStorage)
}
