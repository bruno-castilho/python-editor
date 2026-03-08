import 'dotenv/config'
import { env } from '@python-editor/env/server'
import nodemailer from 'nodemailer'

export class NodemailerMailer {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth:
      env.SMTP_USER || env.SMTP_PASSWORD
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD,
          }
        : {},
  })

  async send(params: { to: string; subject: string; html: string }) {
    const { to, subject, html } = params
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    })
  }
}
