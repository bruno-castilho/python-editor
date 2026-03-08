import type { IHasher } from '../../src/cryptography/interfaces/hasher'

export class FakeHasher implements IHasher {
  async compare(text: string, hashedText: string) {
    return text === hashedText
  }

  async hash(text: string) {
    return text
  }
}
