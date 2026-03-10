import mailer from '@python-editor/mailer/index'
import type { ISendPasswordReset } from './interfaces/send-password-reset'
import { env } from '@python-editor/env/server'

export class SendPasswordReset implements ISendPasswordReset {
  async send(params: { email: string; token: string }) {
    const { token, email } = params
    const resetLink = `${env.CORS_ORIGIN}/reset-password?token=${token}`

    await mailer.send({
      to: email,
      subject: 'Redefinição de senha',
      html: `
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no link abaixo para criar uma nova senha. O link expira em 1 hora.</p>
        <a href="${resetLink}">Redefinir senha</a>
        <p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
      `,
    })
  }
}
