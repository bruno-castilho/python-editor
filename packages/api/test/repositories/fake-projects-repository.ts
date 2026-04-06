import { v7 as uuidv7 } from 'uuid'
import type { IProjectsRepository } from '../../src/repositories/interfaces/projects-repository'
import type {
  Project,
  ProjectCreateParams,
} from '../../src/repositories/types/projects'

export class FakeProjectsRepository implements IProjectsRepository {
  public items: Project[] = []
  public userEmails: Map<string, string> = new Map()

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

  async findManyByUser(params: {
    userId: string
    page: number
    perPage: number
    sortBy: 'name' | 'updatedAt'
    orderBy: 'asc' | 'desc'
  }) {
    const { userId, page, perPage, sortBy, orderBy } = params

    const userProjects = this.items.filter(
      (project) => project.createdById === userId,
    )

    const sorted = [...userProjects].sort((projectA, projectB) => {
      const fieldA = projectA[sortBy]
      const fieldB = projectB[sortBy]

      if (fieldA < fieldB) return orderBy === 'asc' ? -1 : 1
      if (fieldA > fieldB) return orderBy === 'asc' ? 1 : -1
      return 0
    })

    const paginated = sorted.slice(page * perPage, page * perPage + perPage)

    const projects = paginated.map((project) => ({
      id: project.id,
      name: project.name,
      updatedAt: project.updatedAt,
      updatedBy: { email: this.userEmails.get(project.createdById) ?? '' },
      sharedWith: [],
    }))

    return { projects, totalCount: userProjects.length }
  }
}
