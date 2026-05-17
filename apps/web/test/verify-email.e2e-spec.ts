import { test, expect } from '@playwright/test'
import { MockServer } from './mocks/server'

test.beforeEach(async ({ page }) => {
  const mockServer = new MockServer()
  mockServer.setTrpcHandler('users.verifyEmail', () => ({
    message: 'Email verified successfully!',
  }))
  await mockServer.install(page)
})

test.describe('Verify Email - error states', () => {
  test('should show error page when no token is provided in the URL', async ({
    page,
  }) => {
    await page.goto('/verify-email')

    await expect(
      page.getByText('Verification token not found in the URL.'),
    ).toBeVisible()
  })
})

test.describe('Verify Email - success flow', () => {
  test('should verify email successfully and redirect to sign-in', async ({
    page,
  }) => {
    await page.goto(`/verify-email?token=fake-token`)

    await expect(page.getByText('Verified successfully!')).toBeVisible()
    await expect(
      page.getByText('Your account is active. You can now sign in.'),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL('/sign-in')
  })
})
