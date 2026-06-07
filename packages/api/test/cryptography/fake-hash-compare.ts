import type { IHashCompare } from '../../src/domain/interfaces/cryptography/hash-compare'

export class FakeHashCompare implements IHashCompare {
  async compare(text: string, hashedText: string) {
    return text === hashedText
  }
}
