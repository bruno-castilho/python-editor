import redis from '@python-editor/redis'
import { v4 as uuidv4 } from 'uuid'
import type { IUserSessionsKeyValueStore } from '../domain/interfaces/valkey/user-sessions-key-value-store'
import type { SaveSessionParams, Session } from '../domain/types/session'

export class UserSessionsKeyValueStore implements IUserSessionsKeyValueStore {
  TTL_IN_SECONDS = 60 * 60 * 24 * 7 // 7 days

  private sessionKey(sessionId: string) {
    return `session:${sessionId}`
  }

  private userSessionsKey(userId: string) {
    return `user:sessions:${userId}`
  }

  async save(params: SaveSessionParams) {
    const { userId } = params
    const sessionId = uuidv4()

    const session: Session = {
      ...params,
      sessionId,
    }

    const saveSession = redis.set(
      this.sessionKey(sessionId),
      JSON.stringify(session),
      'EX',
      this.TTL_IN_SECONDS,
    )

    const addToUserSessions = redis.sadd(
      this.userSessionsKey(userId),
      sessionId,
    )

    await Promise.all([saveSession, addToUserSessions])

    return sessionId
  }

  async update(sessionId: string) {
    const raw = await redis.get(this.sessionKey(sessionId))
    if (!raw) return
    const session: Session = {
      ...JSON.parse(raw),
      lastAccess: new Date().toISOString(),
    }
    await redis.set(
      this.sessionKey(sessionId),
      JSON.stringify(session),
      'EX',
      this.TTL_IN_SECONDS,
    )
  }

  async delete(sessionId: string, userId: string) {
    const removeSession = redis.del(this.sessionKey(sessionId))

    const removeToUserSessions = redis.srem(
      this.userSessionsKey(userId),
      sessionId,
    )

    await Promise.all([removeSession, removeToUserSessions])
  }

  async findBySessionId(sessionId: string) {
    const session = await redis.get(this.sessionKey(sessionId))

    if (!session) return null

    return JSON.parse(session) as Session
  }

  async findAllByUserId(userId: string) {
    const sessionIds = await redis.smembers(this.userSessionsKey(userId))

    if (sessionIds.length === 0) return []

    const sessionKeys = sessionIds.map((id) => this.sessionKey(id))

    const rawSessions = await Promise.all(
      sessionKeys.map((key) => redis.get(key)),
    )

    const sessions: Session[] = []
    const expiredSessionIds: string[] = []

    rawSessions.forEach((rawSession, index) => {
      if (rawSession) {
        sessions.push(JSON.parse(rawSession))
        return
      }

      const sessionId = sessionIds[index] as string
      expiredSessionIds.push(sessionId)
    })

    this.removeExpiredUserSessions(userId, expiredSessionIds)

    return sessions
  }

  private async removeExpiredUserSessions(
    userId: string,
    expiredSessionIds: string[],
  ) {
    if (expiredSessionIds.length === 0) return
    await redis.srem(this.userSessionsKey(userId), ...expiredSessionIds)
  }
}
