import mailer from '@python-editor/mailer/index'
import type { ISendEmailVerification } from './interfaces/send-email-verification'
import { env } from '@python-editor/env/server'

export class SendEmailVerification implements ISendEmailVerification {
  async send(params: { email: string; token: string }) {
    const { token, email } = params
    const verificationLink = `${env.CORS_ORIGIN}/verify-email?token=${token}`

    await mailer.send({
      to: email,
      subject: 'Verify your email',
      html: `
        <p>Thank you for signing up!</p>
        <p>Click the link below to verify your email. The link expires in 24 hours.</p>
        <a href="${verificationLink}">Verify email</a>
      `,
    })
  }
}
