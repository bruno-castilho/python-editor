import type { Page } from '@playwright/test'

export interface ProfileFormData {
  name: string
  lastName: string
  newPassword: string
  repeatPassword: string
  password: string
}

export async function fillProfileForm(
  page: Page,
  data: Partial<ProfileFormData>,
): Promise<void> {
  if (data.name !== undefined) await page.fill('#name', data.name)
  if (data.lastName !== undefined) await page.fill('#lastName', data.lastName)
  if (data.newPassword !== undefined)
    await page.fill('#newPassword', data.newPassword)
  if (data.repeatPassword !== undefined)
    await page.fill('#repeatPassword', data.repeatPassword)
  if (data.password !== undefined) await page.fill('#password', data.password)
}

export async function submitProfileForm(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Save' }).click()
}
