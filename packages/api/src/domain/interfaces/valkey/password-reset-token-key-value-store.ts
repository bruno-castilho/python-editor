export interface IPasswordResetTokenKeyValueStore {
  save(params: { hashedToken: string; userId: string }): Promise<void>
  findUserIdByToken(params: { hashedToken: string }): Promise<string | null>
  delete(params: { hashedToken: string }): Promise<void>
}
