import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { env } from '@python-editor/env/server'

export const s3 = new S3Client({
  region: env.STORAGE_REGION,
  endpoint: env.STORAGE_ENDPOINT ?? undefined,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: !!env.STORAGE_ENDPOINT,
})

export { PutObjectCommand, DeleteObjectCommand, GetObjectCommand }
export { Upload } from '@aws-sdk/lib-storage'
