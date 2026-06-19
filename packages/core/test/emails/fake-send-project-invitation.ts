import type { ISendProjectInvitation } from '../../src/domain/interfaces/email/send-project-invitation'

export class FakeSendProjectInvitation implements ISendProjectInvitation {
  public emailsSent: {
    email: string
    projectName: string
    ownerName: string
  }[] = []

  async send(params: {
    email: string
    projectName: string
    ownerName: string
  }) {
    this.emailsSent.push(params)
  }
}
