import type { FindPersonalProjectsDTO } from '@python-editor/schemas/find-personal-projects'
import type { IProjectsRepository } from '../interfaces/repositories/projects-repository'

interface FindPersonalProjectsUseCaseParams {
  dto: FindPersonalProjectsDTO
  userId: string
}

export class FindPersonalProjectsUseCase {
  constructor(
    private avatarDownloadBaseUrl: string,
    private projectsRepository: IProjectsRepository,
  ) {}

  async execute({ dto, userId }: FindPersonalProjectsUseCaseParams) {
    const { page, perPage, sortBy, orderBy } = dto

    const { projects, totalCount } =
      await this.projectsRepository.findManyByUser({
        userId,
        page,
        perPage,
        sortBy,
        orderBy,
      })

    return {
      projects: projects.map((project) => ({
        ...project,
        sharedWith: project.sharedWith.map(({ avatar, ...sharedUser }) => ({
          ...sharedUser,
          avatarUrl: avatar ? `${this.avatarDownloadBaseUrl}/${avatar}` : null,
        })),
      })),
      totalCount,
    }
  }
}
