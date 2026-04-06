import { v7 as uuidv7 } from 'uuid'
import type { IProjectsRepository } from '../../src/repositories/interfaces/projects-repository'
import type {
  Project,
  ProjectCreateParams,
} from '../../src/repositories/types/projects'

export class FakeProjectsRepository implements IProjectsRepository {
  public items: Project[] = []

  async create(params: ProjectCreateParams): Promise<Project> {
    const project: Project = {
      id: uuidv7(),
      name: params.name,
      fileId: params.fileId,
      createdById: params.createdById,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.items.push(project)
    return project
  }
}
