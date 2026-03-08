import mailer from '@python-editor/mailer/index'
import type { ISendEmailVerification } from './interfaces/send-email-verification'
import { env } from '@python-editor/env/server'

export class SendEmailVerification implements ISendEmailVerification {
  async send(params: { email: string; token: string }) {
    const { token, email } = params
    const verificationLink = `${env.CORS_ORIGIN}/verify-email?token=${token}`

    await mailer.send({
      to: email,
      subject: 'Verifique seu e-mail',
      html: `
        <p>Obrigado por se cadastrar!</p>
        <p>Clique no link abaixo para verificar seu e-mail. O link expira em 24 horas.</p>
        <a href="${verificationLink}">Verificar e-mail</a>
      `,
    })
  }
}
