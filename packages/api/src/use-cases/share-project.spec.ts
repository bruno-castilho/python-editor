import { ShareProjectUseCase } from './share-project'
import { Data } from '../../test/repositories/data'
import { FakeProjectsRepository } from '../../test/repositories/fake-projects-repository'
import { FakeUsersRepository } from '../../test/repositories/fake-users-repository'
import { ProjectDoesNotExistError } from './errors/project-does-not-exist-error'
import { NotAllowedToShareProjectError } from './errors/not-allowed-to-share-project-error'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

let data: Data
let projectsRepository: FakeProjectsRepository
let usersRepository: FakeUsersRepository
let sut: ShareProjectUseCase

describe('Share Project Use Case', () => {
  beforeEach(() => {
    data = new Data()
    projectsRepository = new FakeProjectsRepository()
    usersRepository = new FakeUsersRepository(data)
    sut = new ShareProjectUseCase(projectsRepository, usersRepository)
  })

  it('should be able to share a project', async () => {
    const owner = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      hashedPassword: 'hashed',
    })

    const project = await projectsRepository.create({
      name: 'My Project',
      fileId: 'file-001',
      createdById: owner.id,
    })

    const targetUser = await usersRepository.create({
      name: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      hashedPassword: 'hashed',
    })

    const { sharedUser } = await sut.execute({
      dto: { projectId: project.id, email: 'jane@example.com' },
      userId: owner.id,
    })

    expect(sharedUser.email).toBe('jane@example.com')
    expect(sharedUser.id).toBe(targetUser.id)

    const sharedUserIds = projectsRepository.sharedWithRelations.get(project.id)
    expect(sharedUserIds).toContain(targetUser.id)
  })

  it('should not be able to share a project that does not exist', async () => {
    await expect(
      sut.execute({
        dto: { projectId: 'non-existent-id', email: 'jane@example.com' },
        userId: 'any-user-id',
      }),
    ).rejects.toBeInstanceOf(ProjectDoesNotExistError)
  })

  it('should not be able to share a project when user is not the creator', async () => {
    const owner = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      hashedPassword: 'hashed',
    })

    const project = await projectsRepository.create({
      name: 'My Project',
      fileId: 'file-001',
      createdById: owner.id,
    })

    await expect(
      sut.execute({
        dto: { projectId: project.id, email: 'jane@example.com' },
        userId: 'other-user-id',
      }),
    ).rejects.toBeInstanceOf(NotAllowedToShareProjectError)
  })

  it('should not be able to share a project with a non-existent user', async () => {
    const owner = await usersRepository.create({
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      hashedPassword: 'hashed',
    })

    const project = await projectsRepository.create({
      name: 'My Project',
      fileId: 'file-001',
      createdById: owner.id,
    })

    await expect(
      sut.execute({
        dto: { projectId: project.id, email: 'notfound@example.com' },
        userId: owner.id,
      }),
    ).rejects.toBeInstanceOf(UserDoesNotExistsError)
  })
})
