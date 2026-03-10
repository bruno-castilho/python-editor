import type { IPasswordResetTokenKeyValueStore } from '../../src/key-value-stores/interfaces/password-reset-token-key-value-store'

interface TokenEntry {
  userId: string
  expiresAt: Date
}

export class FakePasswordResetTokenKeyValueStore implements IPasswordResetTokenKeyValueStore {
  private ttlMilliseconds = 1000 * 60 * 60 // 1 hour
  public store = new Map<string, TokenEntry>()

  async save(params: { hashedToken: string; userId: string }) {
    const { hashedToken, userId } = params
    const expiresAt = new Date(Date.now() + this.ttlMilliseconds)
    this.store.set(hashedToken, { userId, expiresAt })
  }

  async findUserIdByToken(params: { hashedToken: string }) {
    const { hashedToken } = params
    const entry = this.store.get(hashedToken)

    if (!entry) return null
    if (entry.expiresAt <= new Date()) {
      this.store.delete(hashedToken)
      return null
    }

    return entry.userId
  }

  async delete(params: { hashedToken: string }) {
    const { hashedToken } = params
    this.store.delete(hashedToken)
  }
}
