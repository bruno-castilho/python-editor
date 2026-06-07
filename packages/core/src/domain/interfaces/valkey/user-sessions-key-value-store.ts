import type { SaveSessionParams, Session } from '../../types/session'

export interface IUserSessionsKeyValueStore {
  save(session: SaveSessionParams): Promise<string>
  update(sessionId: string): Promise<void>
  delete(sessionId: string, userId: string): Promise<void>
  findBySessionId(sessionId: string): Promise<Session | null>
  findAllByUserId(userId: string): Promise<Session[]>
}
