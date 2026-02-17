export interface Hasher {
  compare(text: string, hashedText: string): Promise<boolean>

  hash(text: string): Promise<string>
}
