import type {
  PersonalProjectListItem,
  Project,
  ProjectCreateParams,
  ProjectWithoutFileId,
  ProjectWithSharedWith,
  SharedWithMeProjectListItem,
} from '../types/projects'

export interface IProjectsRepository {
  create(params: ProjectCreateParams): Promise<ProjectWithoutFileId>

  findById(params: { projectId: string }): Promise<Project | null>

  findByIdWithSharedWith(params: {
    projectId: string
  }): Promise<ProjectWithSharedWith | null>

  findManyByUser(params: {
    userId: string
    page: number
    perPage: number
    sortBy: 'name' | 'updatedAt'
    orderBy: 'asc' | 'desc'
  }): Promise<{ projects: PersonalProjectListItem[]; totalCount: number }>

  delete(params: { projectId: string }): Promise<void>

  share(params: { projectId: string; userId: string }): Promise<void>

  unshare(params: { projectId: string; userId: string }): Promise<void>

  findManySharedWithUser(params: {
    userId: string
    page: number
    perPage: number
    sortBy: 'name' | 'updatedAt'
    orderBy: 'asc' | 'desc'
  }): Promise<{ projects: SharedWithMeProjectListItem[]; totalCount: number }>
}
