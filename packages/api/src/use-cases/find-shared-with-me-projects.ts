import type { FindSharedWithMeProjectsDTO } from '@python-editor/schemas/find-shared-with-me-projects'
import type { IProjectsRepository } from '../repositories/interfaces/projects-repository'

interface FindSharedWithMeProjectsUseCaseParams {
  dto: FindSharedWithMeProjectsDTO
  userId: string
}

export class FindSharedWithMeProjectsUseCase {
  constructor(private projectsRepository: IProjectsRepository) {}

  async execute({ dto, userId }: FindSharedWithMeProjectsUseCaseParams) {
    const { page, perPage, sortBy, orderBy } = dto

    return this.projectsRepository.findManySharedWithUser({
      userId,
      page,
      perPage,
      sortBy,
      orderBy,
    })
  }
}
