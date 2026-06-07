import type { IProjectsRepository } from '../interfaces/repositories/projects-repository'
import type { IStorage } from '../interfaces/storage/storage'
import { NotAllowedToUpdateProjectError } from '../errors/not-allowed-to-update-project-error'
import { ProjectDoesNotExistError } from '../errors/project-does-not-exist-error'

interface UpdateProjectUseCaseParams {
  userId: string
  dto: {
    projectId: string
    fileBuffer: Buffer
    contentType: string
  }
}

export class UpdateProjectUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private projectStorage: IStorage,
  ) {}

  async execute({ userId, dto }: UpdateProjectUseCaseParams) {
    const { projectId, fileBuffer, contentType } = dto

    const project = await this.projectsRepository.findByIdWithSharedWith({
      projectId,
    })
    if (!project) throw new ProjectDoesNotExistError()

    const isOwner = project.createdById === userId
    const isSharedWith = project.sharedWith.some((user) => user.id === userId)
    if (!isOwner && !isSharedWith) throw new NotAllowedToUpdateProjectError()

    await this.projectStorage.replace({
      fileId: project.fileId,
      body: fileBuffer,
      contentType,
    })

    await this.projectsRepository.update({ projectId, updatedById: userId })
  }
}
