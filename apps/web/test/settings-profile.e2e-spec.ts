import { test, expect } from '@playwright/test'
import { fillProfileForm, submitProfileForm } from './helpers/fill-profile-form'
import { MockServer } from './mocks/server'
import { createFakeUser } from './factories/user'
import { createMockAccessToken } from './factories/token'

test.beforeEach(async ({ page }) => {
  const mockServer = new MockServer()
  mockServer.setTrpcHandler('auth.sessionRefresh', () => {
    const accessToken = createMockAccessToken()

    return { accessToken }
  })
  mockServer.setTrpcHandler('users.getProfile', () => {
    const user = createFakeUser({
      avatarUrl: 'https://example.com/new-avatar.png',
    })

    return {
      user,
    }
  })
  mockServer.setTrpcHandler('users.updateProfile', () => {
    return {
      message: 'Profile updated successfully!',
    }
  })
  mockServer.setTrpcHandler('users.removeAvatar', () => {
    return {
      message: 'Avatar removed successfully!',
    }
  })
  mockServer.setRestHandler('POST', '/upload-avatar', () => ({
    status: 200,
    body: {
      avatarUrl: 'https://example.com/new-avatar.png',
      message: 'Avatar uploaded successfully.',
    },
  }))
  await mockServer.install(page)

  await page.goto('/settings/profile')

  await page.locator('form').evaluate((form: HTMLFormElement) => {
    form.noValidate = true
  })
})

test.describe('Settings Profile - form validation', () => {
  test('should display error for empty first name', async ({ page }) => {
    await fillProfileForm(page, { name: '', password: 'Password1!' })
    await submitProfileForm(page)

    await expect(page.getByText('Enter a first name')).toBeVisible()
  })

  test('should display error for empty last name', async ({ page }) => {
    await fillProfileForm(page, { lastName: '', password: 'Password1!' })
    await submitProfileForm(page)

    await expect(page.getByText('Enter a last name')).toBeVisible()
  })

  test('should display error for current password shorter than 8 characters', async ({
    page,
  }) => {
    await fillProfileForm(page, { password: 'Ab1!' })
    await submitProfileForm(page)

    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible()
  })

  test('should display error for current password without uppercase letter', async ({
    page,
  }) => {
    await fillProfileForm(page, { password: 'password1!' })
    await submitProfileForm(page)

    await expect(
      page.getByText('Password must contain at least one uppercase letter'),
    ).toBeVisible()
  })

  test('should display error for current password without number', async ({
    page,
  }) => {
    await fillProfileForm(page, { password: 'Password!' })
    await submitProfileForm(page)

    await expect(
      page.getByText('Password must contain at least one number'),
    ).toBeVisible()
  })

  test('should display error for current password without special character', async ({
    page,
  }) => {
    await fillProfileForm(page, { password: 'Password1' })
    await submitProfileForm(page)

    await expect(
      page.getByText('Password must contain at least one special character'),
    ).toBeVisible()
  })

  test('should display error for new password shorter than 8 characters', async ({
    page,
  }) => {
    await fillProfileForm(page, {
      newPassword: 'Ab1!',
      password: 'Password1!',
    })
    await submitProfileForm(page)

    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible()
  })

  test('should display error for new password without uppercase letter', async ({
    page,
  }) => {
    await fillProfileForm(page, {
      newPassword: 'password1!',
      password: 'Password1!',
    })
    await submitProfileForm(page)

    await expect(
      page.getByText('Password must contain at least one uppercase letter'),
    ).toBeVisible()
  })

  test('should display error for new password without number', async ({
    page,
  }) => {
    await fillProfileForm(page, {
      newPassword: 'Password!',
      password: 'Password1!',
    })
    await submitProfileForm(page)

    await expect(
      page.getByText('Password must contain at least one number'),
    ).toBeVisible()
  })

  test('should display error for new password without special character', async ({
    page,
  }) => {
    await fillProfileForm(page, {
      newPassword: 'Password1',
      password: 'Password1!',
    })
    await submitProfileForm(page)

    await expect(
      page.getByText('Password must contain at least one special character'),
    ).toBeVisible()
  })

  test('should display error when new passwords do not match', async ({
    page,
  }) => {
    await fillProfileForm(page, {
      newPassword: 'Password1!',
      repeatPassword: 'DifferentPassword2@',
      password: 'Password1!',
    })
    await submitProfileForm(page)

    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })
})

test.describe('Settings Profile - success flow', () => {
  test('should update name and last name successfully', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled({
      timeout: 15_000,
    })

    await fillProfileForm(page, {
      name: 'Jane',
      lastName: 'Smith',
      password: 'Password1!',
    })
    await submitProfileForm(page)

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Profile updated successfully!')
  })

  test('should change password successfully', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled({
      timeout: 15_000,
    })

    await fillProfileForm(page, {
      newPassword: 'NewPassword2@',
      repeatPassword: 'NewPassword2@',
      password: 'Password1!',
    })
    await submitProfileForm(page)

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Profile updated successfully!')
  })
})

test.describe('Settings Profile - avatar', () => {
  test('should upload a new avatar successfully', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled({
      timeout: 15_000,
    })

    await page.locator('input[type="file"]').setInputFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64',
      ),
    })

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Avatar uploaded successfully.')
  })

  test('should display error when uploading file with invalid type', async ({
    page,
  }) => {
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled({
      timeout: 15_000,
    })

    await page.locator('input[type="file"]').setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake-pdf-content'),
    })

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(
      'Only JPEG, PNG, and WebP images are accepted.',
    )
  })

  test('should remove the current avatar successfully', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled({
      timeout: 15_000,
    })

    const removeAvatarButton = page.getByRole('button', {
      name: 'Remove Avatar',
    })
    await expect(removeAvatarButton).toBeEnabled({ timeout: 15_000 })
    await removeAvatarButton.click()

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Avatar removed successfully!')
  })
})
