import { describe, it, expect, beforeEach } from 'vitest'
import { RemoveProjectUseCase } from './remove-project'
import { FakeProjectsRepository } from '../../../test/repositories/fake-projects-repository'
import { ProjectDoesNotExistError } from '../errors/project-does-not-exist-error'
import { NotAllowedToRemoveProjectError } from '../errors/not-allowed-to-remove-project-error'
import { FakeStorage } from '../../../test/storage/fake-storage'

let projectsRepository: FakeProjectsRepository
let projectStorage: FakeStorage
let sut: RemoveProjectUseCase

describe('Remove Project Use Case', () => {
  beforeEach(() => {
    projectsRepository = new FakeProjectsRepository()
    projectStorage = new FakeStorage()
    sut = new RemoveProjectUseCase(projectsRepository, projectStorage)
  })

  it('should be able to remove a project', async () => {
    projectsRepository.items.push({
      id: 'project-id-1',
      name: 'my-project',
      fileId: 'file-id-1',
      createdById: 'user-id-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    projectStorage.store.set('file-id-1', {
      contentType: 'application/zip',
      body: Buffer.alloc(0),
    })

    await sut.execute({
      dto: { projectId: 'project-id-1' },
      userId: 'user-id-1',
    })

    expect(projectsRepository.items).toHaveLength(0)
    expect(projectStorage.store.has('file-id-1')).toBe(false)
  })

  it('should not be able to remove a project that does not exist', async () => {
    await expect(
      sut.execute({
        dto: { projectId: 'non-existent-id' },
        userId: 'user-id-1',
      }),
    ).rejects.toBeInstanceOf(ProjectDoesNotExistError)
  })

  it('should not be able to remove a project that belongs to another user', async () => {
    projectsRepository.items.push({
      id: 'project-id-1',
      name: 'my-project',
      fileId: 'file-id-1',
      createdById: 'user-id-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await expect(
      sut.execute({ dto: { projectId: 'project-id-1' }, userId: 'user-id-2' }),
    ).rejects.toBeInstanceOf(NotAllowedToRemoveProjectError)
  })
})
