import { v7 as uuidv7 } from 'uuid'
import type { IStorage } from './interfaces/storage'
import { DeleteObjectCommand, PutObjectCommand, s3 } from '@python-editor/s3'

abstract class S3Storage implements IStorage {
  constructor(private bucket: string) {}

  async upload(params: {
    body: Buffer
    contentType: string
  }): Promise<{ fileId: string }> {
    const { body, contentType } = params

    const fileId = uuidv7()

    await s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileId,
        Body: body,
        ContentType: contentType,
      }),
    )

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
}

export class AvatarStorage extends S3Storage {
  constructor() {
    const bucket = 'avatars'
    super(bucket)
  }
}
