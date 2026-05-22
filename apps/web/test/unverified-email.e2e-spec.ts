import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { MockServer } from './mocks/server'

test.beforeEach(async ({ page }) => {
  const mockServer = new MockServer()
  mockServer.setTrpcHandler('users.resendVerificationEmail', () => ({
    message: 'Verification email resent successfully.',
  }))
  await mockServer.install(page)
})

test.describe('Unverified Email - page content', () => {
  test('should display the email address from query params', async ({
    page,
  }) => {
    const email = `test-${randomUUID()}@example.com`

    await page.goto(`/unverified-email?email=${encodeURIComponent(email)}`)

    await expect(page.getByText(email)).toBeVisible()
  })

  test('should navigate to /sign-in when "Back to sign in" button is clicked', async ({
    page,
  }) => {
    const email = `test-${randomUUID()}@example.com`

    await page.goto(`/unverified-email?email=${encodeURIComponent(email)}`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Back to sign in' }).click()

    await expect(page).toHaveURL('/sign-in')
  })

  test('should show error page when email query param is missing', async ({
    page,
  }) => {
    await page.goto('/unverified-email')

    await expect(page.getByText('Bad Request')).toBeVisible()
    await expect(page.getByText('No email address was provided')).toBeVisible()
  })
})

test.describe('Unverified Email - resend flow', () => {
  test('should show countdown timer after the verification email is automatically sent', async ({
    page,
  }) => {
    const email = `test-${randomUUID()}@example.com`

    await page.goto(`/unverified-email?email=${encodeURIComponent(email)}`)

    await expect(page.getByText(/Resend available in/)).toBeVisible()
  })

  test('should show success alert when resend button is clicked after cooldown expires', async ({
    page,
  }) => {
    const email = `test-${randomUUID()}@example.com`

    await page.clock.install()
    await page.goto(`/unverified-email?email=${encodeURIComponent(email)}`)

    await page.waitForSelector('text=Resend available in')
    await page.clock.runFor(61000)

    const resendButton = page.getByRole('button', {
      name: 'Resend verification email',
    })

    await expect(resendButton).toBeEnabled()
    await resendButton.click()

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Verification email resent successfully.')
  })
})
