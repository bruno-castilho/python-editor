import type { Readable } from 'stream'

export interface IStorage {
  upload(params: {
    body: Readable
    contentType: string
    onProgress?: (progress: { loaded: number; total?: number }) => void
  }): Promise<{ fileId: string }>

  delete(params: { fileId: string }): Promise<void>
}
