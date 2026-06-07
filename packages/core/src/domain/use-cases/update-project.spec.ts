import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateProjectUseCase } from './update-project'
import { FakeProjectsRepository } from '../../../test/repositories/fake-projects-repository'
import { FakeStorage } from '../../../test/storage/fake-storage'
import { ProjectDoesNotExistError } from '../errors/project-does-not-exist-error'
import { NotAllowedToUpdateProjectError } from '../errors/not-allowed-to-update-project-error'

const ownerId = 'owner-user-id'
const otherUserId = 'other-user-id'
const sharedUserId = 'shared-user-id'

const fileBuffer = Buffer.from('project content')
const contentType = 'application/pdf'

let projectsRepository: FakeProjectsRepository
let projectStorage: FakeStorage
let sut: UpdateProjectUseCase

describe('UpdateProjectUseCase', () => {
  beforeEach(() => {
    projectsRepository = new FakeProjectsRepository()
    projectStorage = new FakeStorage()
    sut = new UpdateProjectUseCase(projectsRepository, projectStorage)
  })

  it('should be able to update a project as the owner', async () => {
    const project = await projectsRepository.create({
      name: 'My Project',
      fileId: 'original-file-id',
      createdById: ownerId,
      updatedById: ownerId,
    })

    projectStorage.store.set('original-file-id', {
      contentType: 'application/pdf',
      body: Buffer.from('old content'),
    })

    await sut.execute({
      userId: ownerId,
      dto: { projectId: project.id, fileBuffer, contentType },
    })

    const stored = projectStorage.store.get('original-file-id')
    expect(stored?.body).toEqual(fileBuffer)
    expect(stored?.contentType).toBe(contentType)

    const updated = projectsRepository.items.find((p) => p.id === project.id)
    expect(updated?.updatedById).toBe(ownerId)
  })

  it('should be able to update a project as a shared user', async () => {
    const project = await projectsRepository.create({
      name: 'Shared Project',
      fileId: 'shared-file-id',
      createdById: ownerId,
      updatedById: ownerId,
    })

    projectStorage.store.set('shared-file-id', {
      contentType: 'application/pdf',
      body: Buffer.from('old content'),
    })

    await projectsRepository.share({
      projectId: project.id,
      userId: sharedUserId,
    })

    await sut.execute({
      userId: sharedUserId,
      dto: { projectId: project.id, fileBuffer, contentType },
    })

    const stored = projectStorage.store.get('shared-file-id')
    expect(stored?.body).toEqual(fileBuffer)

    const updated = projectsRepository.items.find((p) => p.id === project.id)
    expect(updated?.updatedById).toBe(sharedUserId)
  })

  it('should not be able to update a project that does not exist', async () => {
    await expect(
      sut.execute({
        userId: ownerId,
        dto: { projectId: 'non-existent-id', fileBuffer, contentType },
      }),
    ).rejects.toBeInstanceOf(ProjectDoesNotExistError)
  })

  it('should not be able to update a project when user is neither owner nor shared', async () => {
    const project = await projectsRepository.create({
      name: 'Private Project',
      fileId: 'private-file-id',
      createdById: ownerId,
      updatedById: ownerId,
    })

    await expect(
      sut.execute({
        userId: otherUserId,
        dto: { projectId: project.id, fileBuffer, contentType },
      }),
    ).rejects.toBeInstanceOf(NotAllowedToUpdateProjectError)
  })
})
