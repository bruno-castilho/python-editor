import type { Readable } from 'node:stream'
import { v7 as uuidv7 } from 'uuid'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  Upload,
  s3,
} from '@python-editor/s3'
import type { IStorage } from './interfaces/storage'

export class Storage implements IStorage {
  constructor(private bucket: string) {}

  async upload(params: {
    body: Readable
    contentType: string
    onProgress?: (progress: { loaded: number; total?: number }) => void
  }): Promise<{ fileId: string }> {
    const { body, contentType, onProgress } = params
    const fileId = uuidv7()

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: this.bucket,
        Key: fileId,
        Body: body,
        ContentType: contentType,
      },
    })

    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        onProgress({ loaded: progress.loaded ?? 0, total: progress.total })
      })
    }

    await upload.done()
    return { fileId }
  }

  async delete(params: { fileId: string }): Promise<void> {
    const { fileId } = params

    await s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileId,
      }),
    )
  }

  async download(params: { fileId: string }): Promise<Buffer> {
    const { fileId } = params

    const response = await s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileId,
      }),
    )

    return Buffer.from(await response.Body!.transformToByteArray())
  }
}

export class AvatarStorage extends Storage {
  constructor() {
    super('avatars')
  }
}

export class ProjectStorage extends Storage {
  constructor() {
    super('projects')
  }
}
