import type { IProjectsRepository } from '../repositories/interfaces/projects-repository'
import type { IUsersRepository } from '../repositories/interfaces/users-repository'
import type { UnshareProjectDTO } from '@python-editor/schemas/unshare-project'
import { NotAllowedToShareProjectError } from './errors/not-allowed-to-share-project-error'
import { ProjectDoesNotExistError } from './errors/project-does-not-exist-error'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

interface UnshareProjectUseCaseParams {
  dto: UnshareProjectDTO
  userId: string
}

export class UnshareProjectUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async execute({ dto, userId }: UnshareProjectUseCaseParams) {
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

    await this.projectsRepository.unshare({
      projectId: dto.projectId,
      userId: targetUser.id,
    })
  }
}
