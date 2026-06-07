import { beforeEach, describe, expect, it } from 'vitest'
import { FakeProjectsRepository } from '../../../test/repositories/fake-projects-repository'
import { FakeStorage } from '../../../test/storage/fake-storage'
import { DownloadProjectUseCase } from './download-project'
import { NotAllowedToDownloadProjectError } from '../errors/not-allowed-to-download-project-error'
import { ProjectDoesNotExistError } from '../errors/project-does-not-exist-error'

const MOCK_ZIP_CONTENT = Buffer.from('PK\x03\x04')

let projectsRepository: FakeProjectsRepository
let projectStorage: FakeStorage
let sut: DownloadProjectUseCase

describe('Download Project Use Case', () => {
  beforeEach(() => {
    projectsRepository = new FakeProjectsRepository()
    projectStorage = new FakeStorage()
    sut = new DownloadProjectUseCase(projectsRepository, projectStorage)
  })

  it('should be able to download a project as the owner', async () => {
    const { fileId } = await projectStorage.upload({
      body: MOCK_ZIP_CONTENT,
      contentType: 'application/zip',
    })

    projectsRepository.items.push({
      id: 'project-id-1',
      name: 'my-project',
      fileId,
      createdById: 'owner-id',
      updatedById: 'owner-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const { data } = await sut.execute({
      dto: { projectId: 'project-id-1' },
      userId: 'owner-id',
    })

    expect(data).toBeInstanceOf(Buffer)
    expect(data).toEqual(MOCK_ZIP_CONTENT)
  })

  it('should be able to download a project as a shared user', async () => {
    const { fileId } = await projectStorage.upload({
      body: MOCK_ZIP_CONTENT,
      contentType: 'application/zip',
    })

    projectsRepository.items.push({
      id: 'project-id-1',
      name: 'my-project',
      fileId,
      createdById: 'owner-id',
      updatedById: 'owner-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    projectsRepository.sharedWithRelations.set('project-id-1', [
      'shared-user-id',
    ])

    const { data } = await sut.execute({
      dto: { projectId: 'project-id-1' },
      userId: 'shared-user-id',
    })

    expect(data).toBeInstanceOf(Buffer)
  })

  it('should not be able to download a project that does not exist', async () => {
    await expect(
      sut.execute({
        dto: { projectId: 'non-existent-id' },
        userId: 'any-user',
      }),
    ).rejects.toBeInstanceOf(ProjectDoesNotExistError)
  })

  it('should not be able to download a project without permission', async () => {
    const { fileId } = await projectStorage.upload({
      body: MOCK_ZIP_CONTENT,
      contentType: 'application/zip',
    })

    projectsRepository.items.push({
      id: 'project-id-1',
      name: 'my-project',
      fileId,
      createdById: 'owner-id',
      updatedById: 'owner-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await expect(
      sut.execute({
        dto: { projectId: 'project-id-1' },
        userId: 'intruder-id',
      }),
    ).rejects.toBeInstanceOf(NotAllowedToDownloadProjectError)
  })
})
