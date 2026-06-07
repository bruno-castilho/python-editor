import { describe, it, expect, beforeEach } from 'vitest'
import { FindPersonalProjectsUseCase } from './find-personal-projects'
import { FakeProjectsRepository } from '../../../test/repositories/fake-projects-repository'

let projectsRepository: FakeProjectsRepository
let sut: FindPersonalProjectsUseCase
const ownerUserId = 'owner-user-id'
const upddaterUserId = 'updater-user-id'
const ownerEmail = 'owner@example.com'
const updaterEmail = 'updater@example.com'

describe('Find Personal Projects Use Case', () => {
  beforeEach(() => {
    projectsRepository = new FakeProjectsRepository()
    sut = new FindPersonalProjectsUseCase('https://fake', projectsRepository)
  })

  it('should be able to find personal projects with pagination', async () => {
    projectsRepository.userEmails.set(ownerUserId, ownerEmail)
    projectsRepository.userEmails.set(upddaterUserId, updaterEmail)

    projectsRepository.items.push(
      {
        id: 'project-id-1',
        name: 'Alpha',
        fileId: 'file-1',
        createdById: ownerUserId,
        updatedById: upddaterUserId,
        createdAt: new Date(),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'project-id-2',
        name: 'Beta',
        fileId: 'file-2',
        createdById: ownerUserId,
        updatedById: upddaterUserId,
        createdAt: new Date(),
        updatedAt: new Date('2024-02-01'),
      },
      {
        id: 'project-id-3',
        name: 'Gamma',
        fileId: 'file-3',
        createdById: ownerUserId,
        updatedById: upddaterUserId,
        createdAt: new Date(),
        updatedAt: new Date('2024-03-01'),
      },
    )

    const { projects, totalCount } = await sut.execute({
      dto: { page: 0, perPage: 10, sortBy: 'name', orderBy: 'asc' },
      userId: ownerUserId,
    })

    expect(totalCount).toBe(3)
    expect(projects).toHaveLength(3)
    expect(projects[0]?.updatedBy.email).toBe(updaterEmail)
    expect(projects[0]?.sharedWith).toEqual([])
    expect(projects[0]).not.toHaveProperty('fileId')
    expect(projects[0]).not.toHaveProperty('createdBy')
  })
})
