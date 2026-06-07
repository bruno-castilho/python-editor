import db from '@python-editor/db'
import { ProjectStorage } from '../gateways/storages/storage'
import { DownloadProjectUseCase } from '../../domain/use-cases/download-project'
import { ProjectsRepository } from '../gateways/repositories/projects-repository'

export function makeDownloadProjectUseCase() {
  const projectsRepository = new ProjectsRepository(db.prisma)
  const projectStorage = new ProjectStorage()
  return new DownloadProjectUseCase(projectsRepository, projectStorage)
}
