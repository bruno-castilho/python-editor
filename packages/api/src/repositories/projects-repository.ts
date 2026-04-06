import { v7 as uuidv7 } from 'uuid'
import type { IProjectsRepository } from './interfaces/projects-repository'
import prisma from '@python-editor/db'
import type { ProjectCreateParams } from './types/projects'

export class ProjectsRepository implements IProjectsRepository {
  async create(params: ProjectCreateParams) {
    const { createdById, ...data } = params

    const project = await prisma.project.create({
      data: {
        id: uuidv7(),
        ...data,
        createdBy: {
          connect: {
            id: createdById,
          },
        },
      },
    })

    const { fileId: _, ...projectWithoutFileId } = project

    return projectWithoutFileId
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
      prisma.project.findMany({
        where: { createdById: userId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          createdBy: { select: { email: true } },
        },
        orderBy: { [sortBy]: orderBy },
        skip: page * perPage,
        take: perPage,
      }),
      prisma.project.count({ where: { createdById: userId } }),
    ])

    const personalProjects = projects.map(({ createdBy, ...project }) => ({
      ...project,
      updatedBy: { email: createdBy.email },
      sharedWith: [],
    }))

    return { projects: personalProjects, totalCount }
  }
}
