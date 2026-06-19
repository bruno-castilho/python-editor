import type { ISendEmailVerification } from '../../src/domain/interfaces/email/send-email-verification'

export class FakeSendEmailVerification implements ISendEmailVerification {
  public emailsSsent: {
    email: string
    token: string
  }[] = []

  async send(params: { email: string; token: string }) {
    const { email, token } = params
    this.emailsSsent.push({ email, token })
  }
}
