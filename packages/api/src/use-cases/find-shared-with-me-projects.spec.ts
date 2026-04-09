import { describe, it, expect, beforeEach } from 'vitest'
import { FakeProjectsRepository } from '../../test/repositories/fake-projects-repository'
import { FindSharedWithMeProjectsUseCase } from './find-shared-with-me-projects'

let projectsRepository: FakeProjectsRepository
let sut: FindSharedWithMeProjectsUseCase

const ownerUserId = 'owner-user-id'
const upddaterUserId = 'updater-user-id'
const ownerEmail = 'owner@example.com'
const updaterEmail = 'updater@example.com'
const sharedWithUserId = 'shared-user-id'

describe('Find Shared With Me Projects Use Case', () => {
  beforeEach(() => {
    projectsRepository = new FakeProjectsRepository()
    sut = new FindSharedWithMeProjectsUseCase(projectsRepository)
  })

  it('should be able to find projects shared with the user', async () => {
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
    )

    projectsRepository.sharedWithRelations.set('project-id-1', [
      sharedWithUserId,
    ])
    projectsRepository.sharedWithRelations.set('project-id-2', [
      sharedWithUserId,
    ])

    const { projects, totalCount } = await sut.execute({
      dto: { page: 0, perPage: 10, sortBy: 'name', orderBy: 'asc' },
      userId: sharedWithUserId,
    })

    expect(totalCount).toBe(2)
    expect(projects).toHaveLength(2)
    expect(projects[0]?.createdBy.email).toBe(ownerEmail)
    expect(projects[0]?.updatedBy.email).toBe(updaterEmail)
    expect(projects[0]).not.toHaveProperty('fileId')
    expect(projects[0]).not.toHaveProperty('sharedWith')
  })

  it('should not be able to find personal projects that are not shared with the user', async () => {
    const ownerUserId = 'owner-user-id'
    const otherUserId = 'other-user-id'

    projectsRepository.items.push({
      id: 'project-id-1',
      name: 'Alpha',
      fileId: 'file-1',
      createdById: ownerUserId,
      updatedById: upddaterUserId,
      createdAt: new Date(),
      updatedAt: new Date('2024-01-01'),
    })

    const { projects, totalCount } = await sut.execute({
      dto: { page: 0, perPage: 10, sortBy: 'name', orderBy: 'asc' },
      userId: otherUserId,
    })

    expect(totalCount).toBe(0)
    expect(projects).toHaveLength(0)
  })
})
