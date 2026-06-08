import { v7 as uuidv7 } from 'uuid'
import type { IStorage } from '../../src/domain/interfaces/storage/storage'

export class FakeStorage implements IStorage {
  public store = new Map<string, { contentType: string; body: Buffer }>()

  async upload(params: { body: Buffer; contentType: string }) {
    const fileId = uuidv7()
    this.store.set(fileId, {
      contentType: params.contentType,
      body: params.body,
    })
    return { fileId }
  }

  async delete(params: { fileId: string }) {
    const { fileId } = params
    this.store.delete(fileId)
  }

  async download(params: {
    fileId: string
  }): Promise<{ data: Buffer; contentType: string | undefined }> {
    const { fileId } = params
    const entry = this.store.get(fileId)
    if (!entry) throw new Error(`FakeStorage: fileId ${fileId} not found`)
    return { data: entry.body, contentType: entry.contentType }
  }

  async replace(params: { fileId: string; body: Buffer; contentType: string }) {
    this.store.set(params.fileId, {
      contentType: params.contentType,
      body: params.body,
    })
  }
}
