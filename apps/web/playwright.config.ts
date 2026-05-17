import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testMatch: 'test/*.e2e-spec.ts',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 1 : 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  globalSetup: './playwright.global-setup.ts',

  use: {
    baseURL: 'http://localhost:3002',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'npm run dev:test',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SERVER_URL: 'http://localhost:3333',
      NEXT_PUBLIC_OPENROUTER_CALLBACK_URL:
        'http://localhost:3002/openrouter-callback',
      NEXT_PUBLIC_E2E: 'true',
    },
  },
})
