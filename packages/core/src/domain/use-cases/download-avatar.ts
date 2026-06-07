import type { IStorage } from '../interfaces/storage/storage'

interface DownloadAvatarUseCaseParams {
  dto: { fileId: string }
}

export class DownloadAvatarUseCase {
  constructor(private avatarStorage: IStorage) {}

  async execute({ dto }: DownloadAvatarUseCaseParams) {
    const { data, contentType } = await this.avatarStorage.download({
      fileId: dto.fileId,
    })
    return { avatarData: data, contentType }
  }
}
