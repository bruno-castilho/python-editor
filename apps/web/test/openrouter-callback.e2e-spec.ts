import { test, expect } from '@playwright/test'
import { MockOpenrouter } from './mocks/openrouter'

test.describe('OpenRouter Callback - error states', () => {
  test('should show error page when no authorization code is provided in the URL', async ({
    page,
  }) => {
    await page.goto('/openrouter-callback')

    await expect(
      page.getByText('No authorization code received from OpenRouter.'),
    ).toBeVisible()
    await expect(page.getByText('400')).toBeVisible()
    await expect(page.getByText('Bad Request')).toBeVisible()
  })

  test('should show error page when the PKCE verifier is missing from storage', async ({
    page,
  }) => {
    await page.goto('/openrouter-callback?code=test-auth-code')

    await expect(
      page.getByText(
        'An error occurred while processing the OpenRouter callback.',
      ),
    ).toBeVisible()
    await expect(page.getByText('500')).toBeVisible()
    await expect(page.getByText('Internal Error')).toBeVisible()
  })

  test('should show error page when the OpenRouter API returns an error', async ({
    page,
  }) => {
    await page.route(
      (url) => url.hostname === 'openrouter.ai',
      async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        })
      },
    )

    await page.addInitScript(() => {
      localStorage.setItem('openrouter_pkce_verifier', 'test-verifier')
    })

    await page.goto('/openrouter-callback?code=test-auth-code')

    await expect(
      page.getByText(
        'An error occurred while processing the OpenRouter callback.',
      ),
    ).toBeVisible()
    await expect(page.getByText('500')).toBeVisible()
    await expect(page.getByText('Internal Error')).toBeVisible()
  })
})

test.describe('OpenRouter Callback - success flow', () => {
  test('should exchange the authorization code, save the key, and redirect to the editor', async ({
    page,
  }) => {
    const mockOpenrouter = new MockOpenrouter()
    await mockOpenrouter.install(page)

    await page.addInitScript(() => {
      localStorage.setItem('openrouter_pkce_verifier', 'test-verifier')
    })

    await page.goto('/openrouter-callback?code=test-auth-code')

    await page.waitForURL('/editor', { timeout: 15_000 })

    const savedApiKey = await page.evaluate(() =>
      localStorage.getItem('openrouter_api_key'),
    )
    expect(savedApiKey).toBe('sk-or-test-key-12345')
  })
})
