import type {
  ProjectCreateParams,
  ProjectWithoutFileId,
} from '../types/projects'

export interface IProjectsRepository {
  create(params: ProjectCreateParams): Promise<ProjectWithoutFileId>
}
