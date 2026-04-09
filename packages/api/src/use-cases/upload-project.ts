import type { IProjectsRepository } from '../repositories/interfaces/projects-repository'
import type { IStorage } from '../storages/interfaces/storage'

interface UploadProjectParams {
  userId: string
  filename: string
  fileBuffer: Buffer
  contentType: string
}

export class UploadProjectUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private projectStorage: IStorage,
  ) {}

  async execute(params: UploadProjectParams) {
    const { userId, filename, fileBuffer, contentType } = params

    const { fileId } = await this.projectStorage.upload({
      body: fileBuffer,
      contentType,
    })

    const name = filename.replace(/\.zip$/i, '')

    const project = await this.projectsRepository.create({
      name,
      fileId,
      createdById: userId,
      updatedById: userId,
    })

    return { project }
  }
}
