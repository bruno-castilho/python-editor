import type { Readable } from 'node:stream'
import { v7 as uuidv7 } from 'uuid'
import type { IStorage } from '../../src/storages/interfaces/storage'

export class FakeStorage implements IStorage {
  public store = new Map<string, { contentType: string; body: Buffer }>()

  async upload(params: { body: Readable; contentType: string }) {
    const fileId = uuidv7()

    const chunks: Buffer[] = []
    for await (const chunk of params.body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string))
    }

    this.store.set(fileId, {
      contentType: params.contentType,
      body: Buffer.concat(chunks),
    })
    return { fileId }
  }

  async delete(params: { fileId: string }) {
    const { fileId } = params
    this.store.delete(fileId)
  }

  async download(params: { fileId: string }): Promise<Buffer> {
    const { fileId } = params
    const entry = this.store.get(fileId)
    if (!entry) throw new Error(`FakeStorage: fileId ${fileId} not found`)
    return entry.body
  }
}
