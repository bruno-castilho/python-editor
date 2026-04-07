import type { IProjectsRepository } from '../repositories/interfaces/projects-repository'
import type { IProjectStorage } from '../storages/interfaces/project-storage'
import type { RemoveProjectDTO } from '@python-editor/schemas/remove-project'
import { NotAllowedToRemoveProjectError } from './errors/not-allowed-to-remove-project-error'
import { ProjectDoesNotExistError } from './errors/project-does-not-exist-error'

interface RemoveProjectUseCaseParams {
  dto: RemoveProjectDTO
  userId: string
}

export class RemoveProjectUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private projectStorage: IProjectStorage,
  ) {}

  async execute({ dto, userId }: RemoveProjectUseCaseParams) {
    const project = await this.projectsRepository.findById({
      projectId: dto.projectId,
    })

    if (!project) throw new ProjectDoesNotExistError()
    if (project.createdById !== userId)
      throw new NotAllowedToRemoveProjectError()

    await this.projectStorage.delete({ fileId: project.fileId })
    await this.projectsRepository.delete({ projectId: dto.projectId })
  }
}
