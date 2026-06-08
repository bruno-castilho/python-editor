import { faker } from '@faker-js/faker'
import { ProjectsRepository } from '@python-editor/core/infra/gateways/repositories/projects-repository'

import db from '@python-editor/db'
import { v7 as uuidv7 } from 'uuid'

export async function makeProject(params: {
  name?: string
  fileId?: string
  createdAt?: Date
  updatedAt?: Date
  createdById?: string
  updatedById?: string
}) {
  const projectsRepository = new ProjectsRepository(db.prisma)

  return await projectsRepository.create({
    name: faker.lorem.words(1),
    fileId: uuidv7(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: uuidv7(),
    updatedById: uuidv7(),
    ...params,
  })
}
