export interface IHashCompare {
  compare(text: string, hashedText: string): Promise<boolean>
}
