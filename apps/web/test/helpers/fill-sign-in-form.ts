import type { Page } from '@playwright/test'

export interface SignInFormData {
  email: string
  password: string
}

export async function fillSignInForm(
  page: Page,
  data: Partial<SignInFormData>,
): Promise<void> {
  if (data.email !== undefined) await page.fill('#email', data.email)
  if (data.password !== undefined) await page.fill('#password', data.password)
}

export async function submitSignInForm(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Sign in' }).click()
}
