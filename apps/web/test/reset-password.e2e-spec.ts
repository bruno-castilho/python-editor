import { test, expect } from '@playwright/test'
import {
  fillResetPasswordForm,
  submitResetPasswordForm,
} from './helpers/fill-reset-password-form'
import { MockServer } from './mocks/server'

test.beforeEach(async ({ page }) => {
  const mockServer = new MockServer()
  mockServer.setTrpcHandler('users.resetPassword', () => {
    return { message: 'Password reset successfully!' }
  })
  await mockServer.install(page)

  await page.goto('/reset-password?token=fasfsad3dfa3')
  await page.waitForLoadState('networkidle')

  await page.locator('form').evaluate((form: HTMLFormElement) => {
    form.noValidate = true
  })
})

test.describe('Reset Password - form validation', () => {
  test('should display errors when all fields are empty', async ({ page }) => {
    await submitResetPasswordForm(page)

    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible()
    await expect(page.getByText('This field cannot be empty')).toBeVisible()
  })

  test('should display error for password shorter than 8 characters', async ({
    page,
  }) => {
    await fillResetPasswordForm(page, {
      password: 'Ab1!',
      repeatPassword: 'Ab1!',
    })
    await submitResetPasswordForm(page)

    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible()
  })

  test('should display error for password without uppercase letter', async ({
    page,
  }) => {
    await fillResetPasswordForm(page, {
      password: 'password1!',
      repeatPassword: 'password1!',
    })
    await submitResetPasswordForm(page)

    await expect(
      page.getByText('Password must contain at least one uppercase letter'),
    ).toBeVisible()
  })

  test('should display error for password without number', async ({ page }) => {
    await fillResetPasswordForm(page, {
      password: 'Password!',
      repeatPassword: 'Password!',
    })
    await submitResetPasswordForm(page)

    await expect(
      page.getByText('Password must contain at least one number'),
    ).toBeVisible()
  })

  test('should display error for password without special character', async ({
    page,
  }) => {
    await fillResetPasswordForm(page, {
      password: 'Password1',
      repeatPassword: 'Password1',
    })
    await submitResetPasswordForm(page)

    await expect(
      page.getByText('Password must contain at least one special character'),
    ).toBeVisible()
  })

  test('should display error when confirm password is empty', async ({
    page,
  }) => {
    await fillResetPasswordForm(page, { password: 'Password1!' })
    await submitResetPasswordForm(page)

    await expect(page.getByText('This field cannot be empty')).toBeVisible()
  })

  test('should display error when passwords do not match', async ({ page }) => {
    await fillResetPasswordForm(page, {
      password: 'Password1!',
      repeatPassword: 'DifferentPassword2@',
    })
    await submitResetPasswordForm(page)

    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })
})

test.describe('Reset Password - error states', () => {
  test('should show error page when no token is provided in the URL', async ({
    page,
  }) => {
    await page.goto('/reset-password')

    await expect(
      page.getByText('The reset token was not found in the URL.'),
    ).toBeVisible()
  })
})

test.describe('Reset Password - success flow', () => {
  test('should reset password successfully and redirect to sign-in', async ({
    page,
  }) => {
    await fillResetPasswordForm(page, {
      password: 'NewPassword2@',
      repeatPassword: 'NewPassword2@',
    })
    await submitResetPasswordForm(page)

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Password reset successfully!')
    await expect(page).toHaveURL('/sign-in')
  })
})
