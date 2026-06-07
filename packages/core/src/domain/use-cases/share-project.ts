import type { IProjectsRepository } from '../interfaces/repositories/projects-repository'
import type { IUsersRepository } from '../interfaces/repositories/users-repository'
import type { ShareProjectDTO } from '@python-editor/schemas/share-project'
import { CannotShareProjectWithYourselfError } from '../errors/cannot-share-project-with-yourself-error'
import { NotAllowedToShareProjectError } from '../errors/not-allowed-to-share-project-error'
import { ProjectDoesNotExistError } from '../errors/project-does-not-exist-error'
import { UserDoesNotExistsError } from '../errors/user-does-not-exists-error'

interface ShareProjectUseCaseParams {
  dto: ShareProjectDTO
  userId: string
}

export class ShareProjectUseCase {
  constructor(
    private avatarDownloadBaseUrl: string,
    private projectsRepository: IProjectsRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async execute({ dto, userId }: ShareProjectUseCaseParams) {
    const project = await this.projectsRepository.findById({
      projectId: dto.projectId,
    })

    if (!project) throw new ProjectDoesNotExistError()
    if (project.createdById !== userId)
      throw new NotAllowedToShareProjectError()

    const targetUser = await this.usersRepository.findByEmail({
      email: dto.email,
    })

    if (!targetUser) throw new UserDoesNotExistsError()
    if (targetUser.id === userId)
      throw new CannotShareProjectWithYourselfError()

    await this.projectsRepository.share({
      projectId: dto.projectId,
      userId: targetUser.id,
    })

    return {
      sharedUser: {
        avatar: targetUser.avatar,
        id: targetUser.id,
        name: targetUser.name,
        lastName: targetUser.lastName,
        email: targetUser.email,
        avatarUrl: targetUser.avatar
          ? `${this.avatarDownloadBaseUrl}/${targetUser.avatar}`
          : null,
      },
    }
  }
}
