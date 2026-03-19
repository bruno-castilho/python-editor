import { v7 as uuidv7 } from 'uuid'
import type { IStorage } from '../../src/storages/interfaces/storage'

export class FakeStorage implements IStorage {
  public store = new Map<string, { contentType: string }>()

  async upload(params: { body: Buffer; contentType: string }) {
    const fileId = uuidv7()

    this.store.set(fileId, { contentType: params.contentType })

    return { fileId }
  }

  async delete(params: { fileId: string }) {
    const { fileId } = params
    this.store.delete(fileId)
  }
}
