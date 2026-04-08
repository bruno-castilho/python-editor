import type { IProjectsRepository } from '../repositories/interfaces/projects-repository'
import type { IStorage } from '../storages/interfaces/storage'
import { NotAllowedToDownloadProjectError } from './errors/not-allowed-to-download-project-error'
import { ProjectDoesNotExistError } from './errors/project-does-not-exist-error'

interface DownloadProjectUseCaseParams {
  dto: { projectId: string }
  userId: string
}

export class DownloadProjectUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private projectStorage: IStorage,
  ) {}

  async execute({ dto, userId }: DownloadProjectUseCaseParams) {
    const { projectId } = dto

    const project = await this.projectsRepository.findByIdWithSharedWith({
      projectId,
    })
    if (!project) throw new ProjectDoesNotExistError()

    const isOwner = project.createdById === userId
    const isSharedWith = project.sharedWith.some((user) => user.id === userId)
    if (!isOwner && !isSharedWith) throw new NotAllowedToDownloadProjectError()

    const data = await this.projectStorage.download({ fileId: project.fileId })
    return { data }
  }
}
