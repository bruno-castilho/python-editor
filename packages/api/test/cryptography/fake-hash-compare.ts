import type { IHashCompare } from '../../src/cryptography/interfaces/hash-compare'

export class FakeHashCompare implements IHashCompare {
  async compare(text: string, hashedText: string) {
    return text === hashedText
  }
}
