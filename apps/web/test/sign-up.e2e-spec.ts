import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { fillSignUpForm, submitSignUpForm } from './helpers/fill-sign-up-form'
import { MockServer, trpcError } from './mocks/server'

test.beforeEach(async ({ page }) => {
  const mockServer = new MockServer()
  mockServer.setTrpcHandler('users.registerUser', (input) => {
    const { email } = input as { email: string }
    if (email === 'an-existing-email@example.com')
      throw trpcError('Email already in use.', 'CONFLICT')

    return {
      message:
        'Account created successfully! Check your email to activate your account.',
    }
  })
  await mockServer.install(page)

  await page.goto('/sign-up')

  await page.locator('form').evaluate((form: HTMLFormElement) => {
    form.noValidate = true
  })
})

test.describe('Sign Up - form validation', () => {
  test('should display errors when all fields are empty', async ({ page }) => {
    await submitSignUpForm(page)

    await expect(page.getByText('Enter a first name')).toBeVisible()
    await expect(page.getByText('Enter a last name')).toBeVisible()
    await expect(page.getByText('Invalid email')).toBeVisible()
    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible()
    await expect(page.getByText('This field cannot be empty')).toBeVisible()
  })

  test('should display error for invalid email format', async ({ page }) => {
    await fillSignUpForm(page, {
      name: 'John',
      lastName: 'Doe',
      password: 'Password1!',
      repeatPassword: 'Password1!',
      email: 'not-an-email',
    })
    await submitSignUpForm(page)

    await expect(page.getByText('Invalid email')).toBeVisible()
  })

  test('should display error for password shorter than 8 characters', async ({
    page,
  }) => {
    await fillSignUpForm(page, {
      name: 'John',
      lastName: 'Doe',
      email: `test-${randomUUID()}@example.com`,
      password: 'Ab1!',
      repeatPassword: 'Ab1!',
    })
    await submitSignUpForm(page)

    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible()
  })

  test('should display error for password without uppercase letter', async ({
    page,
  }) => {
    await fillSignUpForm(page, {
      name: 'John',
      lastName: 'Doe',
      email: `test-${randomUUID()}@example.com`,
      password: 'password1!',
      repeatPassword: 'password1!',
    })
    await submitSignUpForm(page)

    await expect(
      page.getByText('Password must contain at least one uppercase letter'),
    ).toBeVisible()
  })

  test('should display error for password without number', async ({ page }) => {
    await fillSignUpForm(page, {
      name: 'John',
      lastName: 'Doe',
      email: `test-${randomUUID()}@example.com`,
      password: 'Password!',
      repeatPassword: 'Password!',
    })
    await submitSignUpForm(page)

    await expect(
      page.getByText('Password must contain at least one number'),
    ).toBeVisible()
  })

  test('should display error for password without special character', async ({
    page,
  }) => {
    await fillSignUpForm(page, {
      name: 'John',
      lastName: 'Doe',
      email: `test-${randomUUID()}@example.com`,
      password: 'Password1',
      repeatPassword: 'Password1',
    })
    await submitSignUpForm(page)

    await expect(
      page.getByText('Password must contain at least one special character'),
    ).toBeVisible()
  })

  test('should display error when repeat password is empty', async ({
    page,
  }) => {
    await fillSignUpForm(page, {
      name: 'John',
      lastName: 'Doe',
      email: `test-${randomUUID()}@example.com`,
      password: 'Password1!',
      repeatPassword: '',
    })
    await submitSignUpForm(page)

    await expect(page.getByText('This field cannot be empty')).toBeVisible()
  })
})

test.describe('Sign Up - success flow', () => {
  test('should register successfully and reset the form', async ({ page }) => {
    await fillSignUpForm(page, {
      name: 'John',
      lastName: 'Doe',
      email: `test-${randomUUID()}@example.com`,
      password: 'Password1!',
      repeatPassword: 'Password1!',
    })
    await submitSignUpForm(page)

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(
      'Account created successfully! Check your email to activate your account.',
    )

    await expect(page.locator('#name')).toHaveValue('')
    await expect(page.locator('#lastName')).toHaveValue('')
    await expect(page.locator('#email')).toHaveValue('')
    await expect(page.locator('#password')).toHaveValue('')
    await expect(page.locator('#repeatPassword')).toHaveValue('')

    await expect(page).toHaveURL('/sign-up')
  })

  test('should show error alert when registering with an already existing email', async ({
    page,
  }) => {
    const formData = {
      name: 'John',
      lastName: 'Doe',
      email: 'an-existing-email@example.com',
      password: 'Password1!',
      repeatPassword: 'Password1!',
    }
    await fillSignUpForm(page, formData)
    await submitSignUpForm(page)

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Email already in use')
  })
})
