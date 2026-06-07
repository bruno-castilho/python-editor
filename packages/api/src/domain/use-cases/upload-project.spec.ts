import { describe, it, expect, beforeEach } from 'vitest'
import { UploadProjectUseCase } from './upload-project'
import { FakeProjectsRepository } from '../../../test/repositories/fake-projects-repository'
import { FakeStorage } from '../../../test/storage/fake-storage'

let projectsRepository: FakeProjectsRepository
let projectStorage: FakeStorage
let sut: UploadProjectUseCase

const makeFileBuffer = () => Buffer.from('fake-zip-content')

describe('Upload Project Use Case', () => {
  beforeEach(() => {
    projectsRepository = new FakeProjectsRepository()
    projectStorage = new FakeStorage()
    sut = new UploadProjectUseCase(projectsRepository, projectStorage)
  })

  it('should be able to upload a project file', async () => {
    const { project } = await sut.execute({
      userId: 'user-id-1',
      filename: 'my-project.zip',
      fileBuffer: makeFileBuffer(),
      contentType: 'application/zip',
    })

    expect(project.name).toBe('my-project')
    expect(project.createdById).toBe('user-id-1')
    expect(projectsRepository.items).toHaveLength(1)
  })
})
