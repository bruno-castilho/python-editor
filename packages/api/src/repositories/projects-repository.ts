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
}
