export interface IHashGenerator {
  hash(text: string): Promise<string>
}
