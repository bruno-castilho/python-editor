export interface ISendProjectInvitation {
  send(params: { email: string; projectName: string; ownerName: string }): Promise<void>
}
