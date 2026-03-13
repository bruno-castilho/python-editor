import mailer from '@python-editor/mailer/index'
import type { ISendPasswordReset } from './interfaces/send-password-reset'
import { env } from '@python-editor/env/server'

export class SendPasswordReset implements ISendPasswordReset {
  async send(params: { email: string; token: string }) {
    const { token, email } = params
    const resetLink = `${env.CORS_ORIGIN}/reset-password?token=${token}`

    await mailer.send({
      to: email,
      subject: 'Password reset',
      html: `
        <p>We received a request to reset your account password.</p>
        <p>Click the link below to create a new password. The link expires in 1 hour.</p>
        <a href="${resetLink}">Reset password</a>
        <p>If you did not request a password reset, ignore this email.</p>
      `,
    })
  }
}
