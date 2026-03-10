import type { ISendPasswordReset } from '../../src/emails/interfaces/send-password-reset'

export class FakeSendPasswordReset implements ISendPasswordReset {
  public emailsSent: {
    email: string
    token: string
  }[] = []

  async send(params: { email: string; token: string }) {
    const { email, token } = params
    this.emailsSent.push({ email, token })
  }
}
