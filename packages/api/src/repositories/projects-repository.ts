import { v7 as uuidv7 } from 'uuid'
import type { IProjectsRepository } from './interfaces/projects-repository'
import { PrismaClient } from '@python-editor/db'
import type { ProjectCreateParams } from './types/projects'

export class ProjectsRepository implements IProjectsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(params: ProjectCreateParams) {
    const { createdById, updatedById, id, ...data } = params

    const project = await this.prisma.project.create({
      data: {
        id: id || uuidv7(),
        ...data,
        createdBy: {
          connect: {
            id: createdById,
          },
        },
        updatedBy: {
          connect: {
            id: updatedById,
          },
        },
      },
    })

    const { fileId: _, ...projectWithoutFileId } = project

    return projectWithoutFileId
  }

  async findById(params: { projectId: string }) {
    return this.prisma.project.findUnique({ where: { id: params.projectId } })
  }

  async findByIdWithSharedWith(params: { projectId: string }) {
    return this.prisma.project.findUnique({
      where: { id: params.projectId },
      include: { sharedWith: { select: { id: true } } },
    })
  }

  async findManyByUser(params: {
    userId: string
    page: number
    perPage: number
    sortBy: 'name' | 'updatedAt'
    orderBy: 'asc' | 'desc'
  }) {
    const { userId, page, perPage, sortBy, orderBy } = params

    const [projects, totalCount] = await Promise.all([
      this.prisma.project.findMany({
        where: { createdById: userId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          updatedBy: { select: { email: true } },
          sharedWith: {
            select: {
              id: true,
              name: true,
              lastName: true,
              avatar: true,
              email: true,
            },
          },
        },
        orderBy: { [sortBy]: orderBy },
        skip: page * perPage,
        take: perPage,
      }),
      this.prisma.project.count({ where: { createdById: userId } }),
    ])

    return { projects, totalCount }
  }

  async findManySharedWithUser(params: {
    userId: string
    page: number
    perPage: number
    sortBy: 'name' | 'updatedAt'
    orderBy: 'asc' | 'desc'
  }) {
    const { userId, page, perPage, sortBy, orderBy } = params

    const [projects, totalCount] = await Promise.all([
      this.prisma.project.findMany({
        where: { sharedWith: { some: { id: userId } } },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          createdBy: { select: { email: true } },
          updatedBy: { select: { email: true } },
        },
        orderBy: { [sortBy]: orderBy },
        skip: page * perPage,
        take: perPage,
      }),
      this.prisma.project.count({
        where: { sharedWith: { some: { id: userId } } },
      }),
    ])

    return {
      projects,
      totalCount,
    }
  }

  async update(params: { projectId: string; updatedById: string }) {
    const { projectId, updatedById } = params

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        updatedAt: new Date(),
        updatedBy: { connect: { id: updatedById } },
      },
    })
  }

  async delete(params: { projectId: string }) {
    await this.prisma.project.delete({ where: { id: params.projectId } })
  }

  async share(params: { projectId: string; userId: string }) {
    await this.prisma.project.update({
      where: { id: params.projectId },
      data: { sharedWith: { connect: { id: params.userId } } },
    })
  }

  async unshare(params: { projectId: string; userId: string }) {
    await this.prisma.project.update({
      where: { id: params.projectId },
      data: { sharedWith: { disconnect: { id: params.userId } } },
    })
  }
}
