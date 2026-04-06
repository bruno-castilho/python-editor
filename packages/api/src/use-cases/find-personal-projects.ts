import type { FindPersonalProjectsDTO } from '@python-editor/schemas/find-personal-projects'
import type { IProjectsRepository } from '../repositories/interfaces/projects-repository'

interface FindPersonalProjectsUseCaseParams {
  dto: FindPersonalProjectsDTO
  userId: string
}

export class FindPersonalProjectsUseCase {
  constructor(private projectsRepository: IProjectsRepository) {}

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

    return { projects, totalCount }
  }
}
