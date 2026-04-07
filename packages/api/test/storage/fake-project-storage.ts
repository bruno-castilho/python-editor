import { Readable } from 'node:stream'
import { v7 as uuidv7 } from 'uuid'
import type { IProjectStorage } from '../../src/storages/interfaces/project-storage'

export class FakeProjectStorage implements IProjectStorage {
  public store = new Map<string, { contentType: string }>()

  async upload(params: {
    body: Readable
    contentType: string
    onProgress?: (progress: { loaded: number; total?: number }) => void
  }): Promise<{ fileId: string }> {
    const { body, contentType, onProgress } = params
    const fileId = uuidv7()

    await new Promise<void>((resolve, reject) => {
      let loaded = 0
      body.on('data', (chunk: Buffer) => {
        loaded += chunk.length
        onProgress?.({ loaded })
      })
      body.on('end', resolve)
      body.on('error', reject)
    })

    this.store.set(fileId, { contentType })
    return { fileId }
  }

  async delete(params: { fileId: string }): Promise<void> {
    this.store.delete(params.fileId)
  }
}
