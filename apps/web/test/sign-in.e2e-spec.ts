import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { fillSignInForm, submitSignInForm } from './helpers/fill-sign-in-form'
import { MockServer, trpcError } from './mocks/server'
import { createFakeUser } from './factories/user'
import { createMockAccessToken } from './factories/token'

test.beforeEach(async ({ page }) => {
  const mockServer = new MockServer()
  mockServer.setTrpcHandler('auth.signIn', (input) => {
    const { email } = input as { email: string }

    if (email === 'wrong-email@example.com')
      throw trpcError('Invalid credentials.', 'UNAUTHORIZED')

    if (email === 'unverified-email@exampple.com')
      throw trpcError(
        'Email not verified. Please check your inbox.',
        'FORBIDDEN',
      )

    const user = createFakeUser({ email })
    const accessToken = createMockAccessToken()

    return {
      message: `Hello, ${user.name}! Welcome back.`,
      user,
      accessToken,
    }
  })
  mockServer.setTrpcHandler('auth.sessionRefresh', () => {
    const accessToken = createMockAccessToken()
    return { accessToken }
  })
  await mockServer.install(page)

  await page.goto('/sign-in')

  await page.locator('form').evaluate((form: HTMLFormElement) => {
    form.noValidate = true
  })
})

test.describe('Sign In - form validation', () => {
  test('should display errors when all fields are empty', async ({ page }) => {
    await submitSignInForm(page)

    await expect(page.getByText('Invalid email')).toBeVisible()
    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible()
  })

  test('should display error for invalid email format', async ({ page }) => {
    await fillSignInForm(page, {
      email: 'not-an-email',
      password: 'Password1!',
    })
    await submitSignInForm(page)

    await expect(page.getByText('Invalid email')).toBeVisible()
  })

  test('should display error for password shorter than 8 characters', async ({
    page,
  }) => {
    await fillSignInForm(page, {
      email: `test-${randomUUID()}@example.com`,
      password: 'Ab1!',
    })
    await submitSignInForm(page)

    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible()
  })

  test('should display error for password without uppercase letter', async ({
    page,
  }) => {
    await fillSignInForm(page, {
      email: `test-${randomUUID()}@example.com`,
      password: 'password1!',
    })
    await submitSignInForm(page)

    await expect(
      page.getByText('Password must contain at least one uppercase letter'),
    ).toBeVisible()
  })

  test('should display error for password without number', async ({ page }) => {
    await fillSignInForm(page, {
      email: `test-${randomUUID()}@example.com`,
      password: 'Password!',
    })
    await submitSignInForm(page)

    await expect(
      page.getByText('Password must contain at least one number'),
    ).toBeVisible()
  })

  test('should display error for password without special character', async ({
    page,
  }) => {
    await fillSignInForm(page, {
      email: `test-${randomUUID()}@example.com`,
      password: 'Password1',
    })
    await submitSignInForm(page)

    await expect(
      page.getByText('Password must contain at least one special character'),
    ).toBeVisible()
  })
})

test.describe('Sign In - success flow', () => {
  test('should redirect to /unverified-email when user is not verified', async ({
    page,
  }) => {
    await fillSignInForm(page, {
      email: 'unverified-email@exampple.com',
      password: 'Password1!',
    })
    await submitSignInForm(page)

    await expect(page).toHaveURL(
      `/unverified-email?email=${encodeURIComponent('unverified-email@exampple.com')}`,
    )
  })

  test('should show error alert when credentials are invalid', async ({
    page,
  }) => {
    await fillSignInForm(page, {
      email: 'wrong-email@example.com',
      password: 'Password1!',
    })
    await submitSignInForm(page)

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Invalid credentials')
  })

  test('should redirect to /editor after successful sign-in', async ({
    page,
  }) => {
    await fillSignInForm(page, {
      email: `test-${randomUUID()}@example.com`,
      password: 'Password1!',
    })
    await submitSignInForm(page)

    await expect(page).toHaveURL('/editor')
  })
})
