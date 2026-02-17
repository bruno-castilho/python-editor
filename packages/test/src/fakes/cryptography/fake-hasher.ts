import type { Hasher } from '@python-editor/cryptography/interfaces/hasher'

export class FakeHasher implements Hasher {
  async compare(text: string, hashedText: string) {
    return text === hashedText
  }

  async hash(text: string) {
    return text
  }
}
