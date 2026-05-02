import db from '@python-editor/db'
import { ProjectsRepository } from '../../repositories/projects-repository'
import { ProjectStorage } from '../../storages/storage'
import { UploadProjectUseCase } from '../upload-project'

export function makeUploadProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const projectStorage = new ProjectStorage()
  return new UploadProjectUseCase(projectsRepository, projectStorage)
}
