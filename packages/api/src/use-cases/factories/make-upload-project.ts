import { ProjectsRepository } from '../../repositories/projects-repository'
import { ProjectStorage } from '../../storages/storage'
import { UploadProjectUseCase } from '../upload-project'

export function makeUploadProjectUseCase() {
  const projectsRepository = new ProjectsRepository()
  const projectStorage = new ProjectStorage()
  return new UploadProjectUseCase(projectsRepository, projectStorage)
}
