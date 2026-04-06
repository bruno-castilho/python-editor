import type {
  PersonalProjectListItem,
  ProjectCreateParams,
  ProjectWithoutFileId,
} from '../types/projects'

export interface IProjectsRepository {
  create(params: ProjectCreateParams): Promise<ProjectWithoutFileId>

  findManyByUser(params: {
    userId: string
    page: number
    perPage: number
    sortBy: 'name' | 'updatedAt'
    orderBy: 'asc' | 'desc'
  }): Promise<{ projects: PersonalProjectListItem[]; totalCount: number }>
}
