import { v7 as uuidv7 } from 'uuid'
import { ProjectsRepository } from '../../src/repositories/projects-repository'
import { faker } from '@faker-js/faker'

export function makeProject(params: {
  id?: string
  name?: string
  fileId?: string
  createdAt?: Date
  updatedAt?: Date
  createdById?: string
  updatedById?: string
}) {
  return {
    id: uuidv7(),
    name: faker.lorem.words(1),
    fileId: uuidv7(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: uuidv7(),
    updatedById: uuidv7(),
    ...params,
  }
}

export async function makePrismaProject(params: {
  id?: string
  name?: string
  fileId?: string
  createdAt?: Date
  updatedAt?: Date
  createdById?: string
  updatedById?: string
}) {
  const projectsRepository = new ProjectsRepository()

  const project = makeProject(params)

  const created = await projectsRepository.create(project)

  return { ...created, fileId: project.fileId }
}
