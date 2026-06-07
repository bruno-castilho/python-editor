import { v7 as uuidv7 } from 'uuid'
import type { IProjectsRepository } from '../../src/domain/interfaces/repositories/projects-repository'
import type {
  Project,
  ProjectCreateParams,
  ProjectUpdateParams,
  ProjectWithSharedWith,
  SharedWithMeProjectListItem,
} from '../../src/domain/types/projects'

export class FakeProjectsRepository implements IProjectsRepository {
  public items: Project[] = []
  public userEmails: Map<string, string> = new Map()
  public sharedWithRelations: Map<string, string[]> = new Map()
  public userDetails: Map<
    string,
    { name: string; lastName: string; email: string; avatar: string }
  > = new Map()

  async create(params: ProjectCreateParams): Promise<Project> {
    const project: Project = {
      id: uuidv7(),
      name: params.name,
      fileId: params.fileId,
      createdById: params.createdById,
      updatedById: params.updatedById,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.items.push(project)
    return project
  }

  async findById(params: { projectId: string }): Promise<Project | null> {
    return this.items.find((project) => project.id === params.projectId) ?? null
  }

  async findByIdWithSharedWith(params: {
    projectId: string
  }): Promise<ProjectWithSharedWith | null> {
    const project = this.items.find((p) => p.id === params.projectId) ?? null
    if (!project) return null
    const sharedUserIds = this.sharedWithRelations.get(project.id) ?? []
    return { ...project, sharedWith: sharedUserIds.map((id) => ({ id })) }
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

    const projects = paginated.map((project) => {
      const sharedUserIds = this.sharedWithRelations.get(project.id) ?? []
      const sharedWith = sharedUserIds
        .map((sharedUserId) => {
          const details = this.userDetails.get(sharedUserId)
          if (!details) return null
          return { id: sharedUserId, ...details }
        })
        .filter(
          (sharedUser): sharedUser is NonNullable<typeof sharedUser> =>
            sharedUser !== null,
        )

      return {
        id: project.id,
        name: project.name,
        updatedAt: project.updatedAt,
        updatedBy: { email: this.userEmails.get(project.updatedById) ?? '' },
        sharedWith,
      }
    })

    return { projects, totalCount: userProjects.length }
  }

  async findManySharedWithUser(params: {
    userId: string
    page: number
    perPage: number
    sortBy: 'name' | 'updatedAt'
    orderBy: 'asc' | 'desc'
  }): Promise<{ projects: SharedWithMeProjectListItem[]; totalCount: number }> {
    const { userId, page, perPage, sortBy, orderBy } = params

    const sharedProjects = this.items.filter((project) => {
      const sharedUserIds = this.sharedWithRelations.get(project.id) ?? []
      return sharedUserIds.includes(userId)
    })

    const sorted = [...sharedProjects].sort((projectA, projectB) => {
      const fieldA = projectA[sortBy]
      const fieldB = projectB[sortBy]

      if (fieldA < fieldB) return orderBy === 'asc' ? -1 : 1
      if (fieldA > fieldB) return orderBy === 'asc' ? 1 : -1
      return 0
    })

    const paginated = sorted.slice(page * perPage, page * perPage + perPage)

    const projects = paginated.map((project) => {
      const createdByEmail = this.userEmails.get(project.createdById) ?? ''
      const updatedByEmail = this.userEmails.get(project.updatedById) ?? ''
      return {
        id: project.id,
        name: project.name,
        updatedAt: project.updatedAt,
        createdBy: { email: createdByEmail },
        updatedBy: { email: updatedByEmail },
      }
    })

    return { projects, totalCount: sharedProjects.length }
  }

  async delete(params: { projectId: string }): Promise<void> {
    const index = this.items.findIndex(
      (project) => project.id === params.projectId,
    )
    if (index !== -1) this.items.splice(index, 1)
  }

  async update(params: ProjectUpdateParams) {
    const item = this.items.find((item) => item.id === params.projectId)

    if (!item) return

    Object.assign(item, {
      updatedAt: new Date(),
      updatedById: params.updatedById,
    })
  }

  async share(params: { projectId: string; userId: string }): Promise<void> {
    const sharedUserIds = this.sharedWithRelations.get(params.projectId) ?? []
    if (!sharedUserIds.includes(params.userId)) {
      this.sharedWithRelations.set(params.projectId, [
        ...sharedUserIds,
        params.userId,
      ])
    }
  }

  async unshare(params: { projectId: string; userId: string }): Promise<void> {
    const sharedUserIds = this.sharedWithRelations.get(params.projectId) ?? []
    this.sharedWithRelations.set(
      params.projectId,
      sharedUserIds.filter((sharedUserId) => sharedUserId !== params.userId),
    )
  }
}
