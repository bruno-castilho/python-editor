import { createHash, timingSafeEqual } from 'node:crypto'
import type { IHasher } from '../interfaces/hasher'

export class PasswordResetTokenHasher implements IHasher {
  async hash(token: string) {
    return createHash('sha256').update(token).digest('hex')
  }

  async compare(token: string, hashedToken: string) {
    const tokenHash = createHash('sha256').update(token).digest()
    const hashedTokenBuffer = Buffer.from(hashedToken, 'hex')
    if (tokenHash.length !== hashedTokenBuffer.length) return false
    return timingSafeEqual(tokenHash, hashedTokenBuffer)
  }
}
