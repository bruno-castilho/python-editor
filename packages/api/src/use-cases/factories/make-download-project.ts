import db from '@python-editor/db'
import { ProjectsRepository } from '../../repositories/projects-repository'
import { ProjectStorage } from '../../storages/storage'
import { DownloadProjectUseCase } from '../download-project'

export function makeDownloadProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const projectStorage = new ProjectStorage()
  return new DownloadProjectUseCase(projectsRepository, projectStorage)
}
