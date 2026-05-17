import type { Page } from '@playwright/test'

export interface ResetPasswordFormData {
  password: string
  repeatPassword: string
}

export async function fillResetPasswordForm(
  page: Page,
  data: Partial<ResetPasswordFormData>,
): Promise<void> {
  if (data.password !== undefined) await page.fill('#password', data.password)
  if (data.repeatPassword !== undefined)
    await page.fill('#repeatPassword', data.repeatPassword)
}

export async function submitResetPasswordForm(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Reset password' }).click()
}
