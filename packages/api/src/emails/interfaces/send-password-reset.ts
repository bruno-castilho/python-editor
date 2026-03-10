export interface ISendPasswordReset {
  send(params: { email: string; token: string }): Promise<void>
}
