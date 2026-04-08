import type { Readable } from 'node:stream'
import type { IProjectsRepository } from '../repositories/interfaces/projects-repository'
import type { IStorage } from '../storages/interfaces/storage'

interface UploadProjectParams {
  userId: string
  filename: string
  fileStream: Readable
  contentType: string
  onProgress?: (progress: { loaded: number; total?: number }) => void
}

export class UploadProjectUseCase {
  constructor(
    private projectsRepository: IProjectsRepository,
    private projectStorage: IStorage,
  ) {}

  async execute(params: UploadProjectParams) {
    const { userId, filename, fileStream, contentType, onProgress } = params

    const { fileId } = await this.projectStorage.upload({
      body: fileStream,
      contentType,
      onProgress,
    })

    const name = filename.replace(/\.zip$/i, '')

    const project = await this.projectsRepository.create({
      name,
      fileId,
      createdById: userId,
    })

    return { project }
  }
}
