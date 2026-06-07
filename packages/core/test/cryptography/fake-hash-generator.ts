import type { IHashGenerator } from '../../src/domain/interfaces/cryptography/hash-generator'

export class FakeHashGenerator implements IHashGenerator {
  async hash(text: string) {
    return text
  }
}
