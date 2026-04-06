import type { Readable } from 'node:stream'

export interface IProjectStorage {
  upload(params: {
    body: Readable
    contentType: string
    onProgress?: (progress: { loaded: number; total?: number }) => void
  }): Promise<{ fileId: string }>
}
