import type { Page } from '@playwright/test'

export async function injectOpenRouterKey(
  page: Page,
  apiKey: string,
): Promise<void> {
  await page.evaluate((key) => {
    localStorage.setItem('openrouter_api_key', key)
  }, apiKey)
}
