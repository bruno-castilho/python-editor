import { test, expect } from '@playwright/test'
import { MockServer } from './mocks/server'
import { createFakeSharedWithMeProject } from './factories/project'
import { createMockAccessToken } from './factories/token'
import type { FindSharedWithMeProjectsDTO } from '@python-editor/schemas/find-shared-with-me-projects'

test.beforeEach(async ({ page }) => {
  const mockServer = new MockServer()
  mockServer.setTrpcHandler('auth.sessionRefresh', () => {
    const accessToken = createMockAccessToken()

    return { accessToken }
  })
  mockServer.setTrpcHandler('projects.findSharedWithMeProjects', (input) => {
    const { page, perPage, orderBy, sortBy } =
      input as FindSharedWithMeProjectsDTO

    const allProjects = Array.from({ length: 20 }, (_, i) =>
      createFakeSharedWithMeProject({
        name: `project-${String(i).padStart(2, '0')}`,
        updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      }),
    )

    const sorted = [...allProjects].sort((a, b) => {
      const valA = a[sortBy]
      const valB = b[sortBy]
      const comparison = valA < valB ? -1 : valA > valB ? 1 : 0
      return orderBy === 'desc' ? -comparison : comparison
    })

    const start = page * perPage

    return {
      projects: sorted.slice(start, start + perPage),
      totalCount: allProjects.length,
    }
  })
  await mockServer.install(page)

  await page.goto('/projects/shared-with-me')
})

test.describe('Shared With Me Projects - pagination', () => {
  test('should navigate to the next page', async ({ page }) => {
    await page.goto('/projects/shared-with-me?perPage=1')

    const button = page.getByRole('button', { name: 'Go to next page' })

    await expect(button).toBeEnabled({ timeout: 15_000 })
    await button.click()

    await expect(page).toHaveURL(/page=1/)
  })

  test('should change rows per page', async ({ page }) => {
    await page.getByLabel('Rows per page:').click()
    await page.getByRole('option', { name: '25' }).click()

    await expect(page).toHaveURL(/perPage=25/)
    await expect(page).toHaveURL(/page=0/)
  })
})

test.describe('Shared With Me Projects - sorting', () => {
  test('should update URL with sortBy=name when Name header is clicked', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Name' }).click()
    await expect(page).toHaveURL(/sortBy=name/)
  })

  test('should toggle sort direction when Name header is clicked twice', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Name' }).click()
    await expect(page).toHaveURL(/orderBy=desc/)

    await page.getByRole('button', { name: 'Name' }).click()
    await expect(page).toHaveURL(/orderBy=asc/)
  })

  test('should update URL with sortBy=updatedAt when Updated at header is clicked', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Updated at' }).click()
    await expect(page).toHaveURL(/sortBy=updatedAt/)
  })

  test('should toggle sort direction when Updated At header is clicked twice', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Updated At' }).click()
    await expect(page).toHaveURL(/orderBy=desc/)

    await page.getByRole('button', { name: 'Updated At' }).click()
    await expect(page).toHaveURL(/orderBy=asc/)
  })

  test('should display projects sorted by name ascending', async ({ page }) => {
    await page.goto('/projects/shared-with-me?sortBy=name&orderBy=asc')

    const rows = page
      .locator('tbody tr')
      .filter({ has: page.getByRole('link') })
    await expect(rows.first()).toContainText('project-00', { timeout: 15_000 })
  })

  test('should display projects sorted by name descending', async ({
    page,
  }) => {
    await page.goto('/projects/shared-with-me?sortBy=name&orderBy=desc')

    const rows = page
      .locator('tbody tr')
      .filter({ has: page.getByRole('link') })
    await expect(rows.first()).toContainText('project-19', { timeout: 15_000 })
  })

  test('should display projects sorted by updatedAt ascending', async ({
    page,
  }) => {
    await page.goto('/projects/shared-with-me?sortBy=updatedAt&orderBy=asc')

    const rows = page
      .locator('tbody tr')
      .filter({ has: page.getByRole('link') })
    const updatedAtCell = rows.first().locator('th').nth(4)
    await expect(updatedAtCell).toContainText('19 days ago', {
      timeout: 15_000,
    })
  })

  test('should display projects sorted by updatedAt descending', async ({
    page,
  }) => {
    await page.goto('/projects/shared-with-me?sortBy=updatedAt&orderBy=desc')

    const rows = page
      .locator('tbody tr')
      .filter({ has: page.getByRole('link') })
    const updatedAtCell = rows.first().locator('th').nth(4)
    await expect(updatedAtCell).toContainText('less than a minute ago', {
      timeout: 15_000,
    })
  })
})
