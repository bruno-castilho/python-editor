import type { IHashGenerator } from '../../src/cryptography/interfaces/hash-generator'

export class FakeHashGenerator implements IHashGenerator {
  async hash(text: string) {
    return text
  }
}
