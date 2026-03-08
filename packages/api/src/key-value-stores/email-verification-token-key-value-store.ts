import redis from '@python-editor/redis'
import type { IEmailVerificationTokenKeyValueStore } from './interfaces/email-verification-token-key-value-store'

export class EmailVerificationTokenKeyValueStore implements IEmailVerificationTokenKeyValueStore {
  TTL_IN_SECONDS = 60 * 60 * 24 // 24 hours

  constructor() {}

  private key(hashedToken: string) {
    return `email-verification-token:${hashedToken}`
  }

  async save(params: { hashedToken: string; userId: string }): Promise<void> {
    await redis.set(
      this.key(params.hashedToken),
      params.userId,
      'EX',
      this.TTL_IN_SECONDS,
    )
  }

  async findUserIdByToken(params: {
    hashedToken: string
  }): Promise<string | null> {
    return redis.get(this.key(params.hashedToken))
  }

  async delete(params: { hashedToken: string }): Promise<void> {
    await redis.del(this.key(params.hashedToken))
  }
}
