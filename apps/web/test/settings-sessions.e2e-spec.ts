import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { MockServer } from './mocks/server'
import { createFakeUser } from './factories/user'
import { createFakeSession } from './factories/session'
import { createMockAccessToken } from './factories/token'

test.beforeEach(async ({ page }) => {
  const user = createFakeUser()
  const sessionId = randomUUID()
  const currentSession = createFakeSession({ sessionId, userId: user.id })
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const anotherSession = createFakeSession({
    userId: user.id,
    lastAccess: twoHoursAgo,
  })

  let getSessionsCallCount = 0

  const mockServer = new MockServer()
  mockServer.setTrpcHandler('auth.sessionRefresh', () => {
    const accessToken = createMockAccessToken(sessionId)

    return { accessToken }
  })
  mockServer.setTrpcHandler('users.getUserSessions', () => {
    if (getSessionsCallCount++ === 0) {
      return { sessions: [currentSession, anotherSession] }
    }

    return { sessions: [currentSession] }
  })
  mockServer.setTrpcHandler('users.revokeUserSession', () => ({
    message: 'Session revoked successfully.',
  }))
  await mockServer.install(page)

  await page.goto('/settings/sessions')
})

test.describe('Settings Sessions - page display', () => {
  test('should display the sessions page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sessions' })).toBeVisible()
  })

  test('should display active status for the current session', async ({
    page,
  }) => {
    await expect(page.getByText('active')).toBeVisible()
  })

  test('should display a disabled revoke button for the current session', async ({
    page,
  }) => {
    const currentSessionRevoke = page
      .getByText('Your current session')
      .locator('../..')
      .getByRole('button', { name: 'Revoke' })
    await expect(currentSessionRevoke).toBeDisabled()
  })
})

test.describe('Settings Sessions - session revocation', () => {
  test('should revoke another session successfully', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Revoke' })).toHaveCount(2, {
      timeout: 15_000,
    })

    await page.getByRole('button', { name: 'Revoke', disabled: false }).click()

    const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Session revoked successfully.')

    await expect(page.getByRole('button', { name: 'Revoke' })).toHaveCount(1)
  })
})
