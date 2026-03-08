export interface ISendEmailVerification {
  send(params: { email: string; token: string }): Promise<void>
}
