import { readFile } from 'node:fs/promises'
import { env } from '@python-editor/env/server'
import type { ISendPasswordReset } from '../../../domain/interfaces/mail/send-password-reset'
import mailer from '@python-editor/mailer/index'
import type { ISendEmailVerification } from '../../../domain/interfaces/mail/send-email-verification'

abstract class SendEmail {
  protected async sendEmail(params: {
    to: string
    subject: string
    title: string
    bodyHtml: string
  }) {
    const { to, title, subject, bodyHtml } = params

    await mailer.send({
      to,
      subject,
      html: await this.renderEmailLayout({
        title,
        bodyHtml,
      }),
    })
  }

  private async renderEmailLayout({
    title,
    bodyHtml,
  }: {
    title: string
    bodyHtml: string
  }): Promise<string> {
    const logoBuffer = await readFile(
      new URL('../../../assets/logo.png', import.meta.url),
    )

    return `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>${title}</title>
              </head>
              <body style="margin:0;padding:0;background-color:#F5F8FC;font-family:Arial,Helvetica,sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F8FC;padding:32px 0;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                        <tr>
                          <td align="center" style="background-color:#3776AB;padding:28px 40px;">
                            <img src="data:image/png;base64,${logoBuffer.toString('base64')}" width="72" height="72" alt="Python Editor" style="display:block;margin:0 auto 12px;" />
                            <span style="display:block;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:0.5px;">Python Editor</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:40px 48px 32px;">
                            ${bodyHtml}
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color:#F5F8FC;padding:20px 48px;border-top:1px solid #E1E8EF;">
                            <p style="margin:0;font-size:12px;color:#57606A;text-align:center;line-height:1.6;">
                              This is an automated message from <strong>Python Editor</strong>.<br />
                              Please do not reply to this email.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>`
  }
}

export class SendPasswordReset extends SendEmail implements ISendPasswordReset {
  public async send(params: { email: string; token: string }) {
    const { token, email } = params
    const resetLink = `${env.CORS_ORIGIN}/reset-password?token=${token}`

    await this.sendEmail({
      to: email,
      subject: 'Reset your Python Editor password',
      title: 'Password reset',
      bodyHtml: this.bodyHtml(resetLink),
    })
  }

  private bodyHtml(resetLink: string) {
    return `
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1F2328;">Password reset</h2>
      <p style="margin:0 0 12px;font-size:15px;color:#1F2328;line-height:1.6;">We received a request to reset the password for your Python Editor account.</p>
      <p style="margin:0 0 28px;font-size:14px;color:#57606A;line-height:1.6;">Click the button below to create a new password. This link expires in <strong>1 hour</strong>.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td align="center" style="border-radius:6px;background-color:#FFD43B;">
            <a href="${resetLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#1F2328;text-decoration:none;border-radius:6px;font-family:Arial,Helvetica,sans-serif;">Reset password</a>
          </td>
        </tr>
      </table>
      <p style="margin:28px 0 0;font-size:13px;color:#57606A;line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br /><a href="${resetLink}" style="color:#3776AB;word-break:break-all;">${resetLink}</a></p>
      <p style="margin:20px 0 0;font-size:13px;color:#57606A;line-height:1.6;">If you did not request a password reset, you can safely ignore this email.</p>
    `
  }
}

export class SendEmailVerification
  extends SendEmail
  implements ISendEmailVerification
{
  public async send(params: { email: string; token: string }) {
    const { token, email } = params
    const verificationLink = `${env.CORS_ORIGIN}/verify-email?token=${token}`

    await this.sendEmail({
      to: email,
      subject: 'Verify your email — Python Editor',
      title: 'Verify your email',
      bodyHtml: this.bodyHtml(verificationLink),
    })
  }

  private bodyHtml(verificationLink: string) {
    return `
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1F2328;">Welcome to Python Editor!</h2>
      <p style="margin:0 0 12px;font-size:15px;color:#1F2328;line-height:1.6;">Thank you for signing up. Please verify your email address to activate your account.</p>
      <p style="margin:0 0 28px;font-size:14px;color:#57606A;line-height:1.6;">This link expires in <strong>24 hours</strong>.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td align="center" style="border-radius:6px;background-color:#FFD43B;">
            <a href="${verificationLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#1F2328;text-decoration:none;border-radius:6px;font-family:Arial,Helvetica,sans-serif;">Verify email</a>
          </td>
        </tr>
      </table>
      <p style="margin:28px 0 0;font-size:13px;color:#57606A;line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br /><a href="${verificationLink}" style="color:#3776AB;word-break:break-all;">${verificationLink}</a></p>
    `
  }
}
