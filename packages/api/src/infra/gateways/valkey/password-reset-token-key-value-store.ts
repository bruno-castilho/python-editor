import redis from '@python-editor/redis'
import type { IPasswordResetTokenKeyValueStore } from '../domain/interfaces/valkey/password-reset-token-key-value-store'

export class PasswordResetTokenKeyValueStore implements IPasswordResetTokenKeyValueStore {
  TTL_IN_SECONDS = 60 * 60 // 1 hour

  private key(hashedToken: string) {
    return `password-reset-token:${hashedToken}`
  }

  async save(params: { hashedToken: string; userId: string }) {
    await redis.set(
      this.key(params.hashedToken),
      params.userId,
      'EX',
      this.TTL_IN_SECONDS,
    )
  }

  async findUserIdByToken(params: { hashedToken: string }) {
    return await redis.get(this.key(params.hashedToken))
  }

  async delete(params: { hashedToken: string }) {
    await redis.del(this.key(params.hashedToken))
  }
}
