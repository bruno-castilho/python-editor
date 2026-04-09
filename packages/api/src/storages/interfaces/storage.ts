import type { Readable } from 'stream'

export interface IStorage {
  upload(params: {
    body: Readable
    contentType: string
    onProgress?: (progress: { loaded: number; total?: number }) => void
  }): Promise<{ fileId: string }>

  replace(params: {
    fileId: string
    body: Buffer
    contentType: string
  }): Promise<void>

  delete(params: { fileId: string }): Promise<void>

  download(params: { fileId: string }): Promise<Buffer>
}
