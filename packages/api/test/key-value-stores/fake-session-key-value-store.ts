import { v4 as uuidv4 } from 'uuid'
import type { IUserSessionsKeyValueStore } from '../../src/key-value-stores/interfaces/user-sessions-key-value-store'
import type {
  SaveSessionParams,
  Session,
} from '../../src/key-value-stores/types/session'

interface SessionEntry {
  data: Session
  expiresAt: Date
}

export class FakeUserSessionsKeyValueStore implements IUserSessionsKeyValueStore {
  private ttlMilliseconds = 1000 * 60 * 60 * 24 * 7 // 7 days
  public store = new Map<string, SessionEntry>()

  async save(params: SaveSessionParams) {
    const sessionId = uuidv4()
    const expiresAt = new Date(Date.now() + this.ttlMilliseconds)
    this.store.set(sessionId, { data: { ...params, sessionId }, expiresAt })

    return sessionId
  }

  async update(sessionId: string) {
    const entry = this.store.get(sessionId)
    if (!entry) return
    entry.expiresAt = new Date(Date.now() + this.ttlMilliseconds)
    entry.data.lastAccess = new Date().toISOString()
  }

  async delete(sessionId: string) {
    this.store.delete(sessionId)
  }

  async findBySessionId(sessionId: string): Promise<Session | null> {
    const entry = this.store.get(sessionId)
    if (!entry) return null
    if (entry.expiresAt <= new Date()) {
      this.store.delete(sessionId)
      return null
    }
    return entry.data
  }

  async findAllByUserId(userId: string) {
    const sessions: Session[] = []
    for (const entry of this.store.values()) {
      if (entry.data.userId === userId && entry.expiresAt > new Date()) {
        sessions.push(entry.data)
      }
    }
    return sessions
  }
}
