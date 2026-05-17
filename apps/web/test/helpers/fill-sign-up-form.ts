import type { Page } from '@playwright/test'

export interface SignUpFormData {
  name: string
  lastName: string
  email: string
  password: string
  repeatPassword: string
}

export async function fillSignUpForm(
  page: Page,
  data: Partial<SignUpFormData>,
): Promise<void> {
  if (data.name !== undefined) await page.fill('#name', data.name)
  if (data.lastName !== undefined) await page.fill('#lastName', data.lastName)
  if (data.email !== undefined) await page.fill('#email', data.email)
  if (data.password !== undefined) await page.fill('#password', data.password)
  if (data.repeatPassword !== undefined)
    await page.fill('#repeatPassword', data.repeatPassword)
}

export async function submitSignUpForm(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'CREATE' }).click()
}
