import { v7 as uuidv7 } from 'uuid'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  Upload,
  s3,
} from '@python-editor/s3'
import { env } from '@python-editor/env/server'
import type { IStorage } from '../../../domain/interfaces/storage/storage'

export class Storage implements IStorage {
  constructor(private bucket: string) {}

  async upload(params: { body: Buffer; contentType: string }) {
    const { body, contentType } = params
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

    await upload.done()
    return { fileId }
  }

  async replace(params: { fileId: string; body: Buffer; contentType: string }) {
    const { fileId, body, contentType } = params
    await s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileId,
        Body: body,
        ContentType: contentType,
      }),
    )
  }

  async delete(params: { fileId: string }) {
    const { fileId } = params

    await s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileId,
      }),
    )
  }

  async download(params: { fileId: string }) {
    const { fileId } = params

    const response = await s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileId,
      }),
    )

    return {
      data: Buffer.from(await response.Body!.transformToByteArray()),
      contentType: response.ContentType,
    }
  }
}

export class AvatarStorage extends Storage {
  constructor() {
    super(env.STORAGE_AVATARS_BUCKET)
  }
}

export class ProjectStorage extends Storage {
  constructor() {
    super(env.STORAGE_PROJECTS_BUCKET)
  }
}
