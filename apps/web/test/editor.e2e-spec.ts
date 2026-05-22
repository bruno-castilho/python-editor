import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { waitForEditorReady } from './helpers/wait-for-editor-ready'
import { setEditorContent } from './helpers/set-editor-content'
import { injectOpenRouterKey } from './helpers/inject-openrouter-key'
import { MockServer } from './mocks/server'
import { createMockAccessToken } from './factories/token'
import { createFakeProject } from './factories/project'
import { MockOpenrouter } from './mocks/openrouter'

test.beforeEach(async ({ page }) => {
  const mockServer = new MockServer()
  mockServer.setTrpcHandler('auth.sessionRefresh', () => {
    const accessToken = createMockAccessToken()

    return { accessToken }
  })
  mockServer.setRestHandler('POST', '/upload-project', () => {
    const project = createFakeProject()

    return {
      status: 200,
      body: {
        message: 'Project uploaded successfully.',
        project,
      },
    }
  })
  await mockServer.install(page)

  await new MockOpenrouter().install(page)

  await page.goto('/editor')
})

test.describe('Editor - Project Execution', () => {
  test('should execute a project and display the expected output', async ({
    page,
  }) => {
    test.setTimeout(90_000)
    await waitForEditorReady(page)
    await setEditorContent(page, 'print("execution test")')

    await page.getByRole('button', { name: 'Run' }).click()

    await expect(page.getByText('execution test')).toBeVisible({
      timeout: 30_000,
    })
  })

  test('should send input to a running program and display the expected output', async ({
    page,
  }) => {
    test.setTimeout(90_000)
    await waitForEditorReady(page)
    await setEditorContent(
      page,
      'name = input("Enter name: ")\nprint(f"Hello, {name}!")',
    )

    await page.getByRole('button', { name: 'Run' }).click()

    await expect(page.getByText('Enter name: ')).toBeVisible({
      timeout: 30_000,
    })

    const terminalInput = page
      .locator('.MuiInputBase-root')
      .last()
      .locator('input')
    await terminalInput.fill('World')
    await terminalInput.press('Enter')

    await expect(page.getByText('Hello, World!')).toBeVisible({
      timeout: 15_000,
    })
  })

  test('should stop an ongoing execution and return to idle state', async ({
    page,
  }) => {
    test.setTimeout(90_000)
    await waitForEditorReady(page)
    await setEditorContent(page, 'print("started")\nwhile True:\n    pass')

    await page.getByRole('button', { name: 'Run' }).click()

    await expect(
      page.locator('pre').filter({ hasText: 'started' }),
    ).toBeVisible({
      timeout: 30_000,
    })

    await page.getByRole('button', { name: 'Stop' }).click()

    await expect(page.getByRole('button', { name: 'Run' })).toBeVisible({
      timeout: 90_000,
    })
  })
})

test.describe('Editor - File Management', () => {
  test('should create a new file', async ({ page }) => {
    test.setTimeout(60_000)
    await page.getByRole('button', { name: 'New File' }).click()

    await expect(page.getByRole('heading', { name: 'New File' })).toBeVisible()

    await page.getByLabel('Nome do arquivo').fill('helper')
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.getByRole('tab', { name: /helper\.py/ })).toBeVisible()
  })

  test('should delete an existing file', async ({ page }) => {
    test.setTimeout(60_000)
    await page.getByRole('button', { name: 'New File' }).click()
    await page.getByLabel('Nome do arquivo').fill('todelete')
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.getByRole('tab', { name: /todelete\.py/ })).toBeVisible()

    await page
      .getByRole('tab', { name: /todelete\.py/ })
      .locator('.MuiIconButton-root')
      .click()

    await expect(
      page.getByRole('tab', { name: /todelete\.py/ }),
    ).not.toBeVisible()
  })
})

test.describe('Editor - Project Persistence', () => {
  test('should save the project locally', async ({ page }) => {
    test.setTimeout(90_000)
    const downloadPromise = page.waitForEvent('download')

    await page.getByRole('button', { name: 'Save' }).click()

    const saveDialog = page.getByRole('dialog', { name: 'Save Project' })
    await expect(saveDialog).toBeVisible()

    await expect(
      saveDialog.getByRole('radio', { name: 'Save locally' }),
    ).toBeChecked()

    await saveDialog.getByLabel('Project name').fill('local-project')
    await saveDialog.getByRole('button', { name: 'Save' }).click()

    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.zip$/)

    await expect(
      page.getByRole('alert').filter({ hasText: 'Project saved locally.' }),
    ).toBeVisible()
  })

  test('should save the project remotely', async ({ page }) => {
    test.setTimeout(90_000)

    await page.getByRole('button', { name: 'Save' }).click()

    const saveDialog = page.getByRole('dialog', { name: 'Save Project' })
    await expect(saveDialog).toBeVisible()

    await saveDialog.getByRole('radio', { name: 'Save remotely' }).click()
    await saveDialog
      .getByLabel('Project name')
      .fill(`remote-project-${randomUUID().slice(0, 8)}`)
    await saveDialog.getByRole('button', { name: 'Save' }).click()

    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: 'Project uploaded successfully.' }),
    ).toBeVisible({ timeout: 15_000 })

    await page.waitForURL(/\/editor\/.+/, { timeout: 15_000 })
  })
})

test.describe('Editor - Chat AI', () => {
  test('should authenticate with OpenRouter via the callback flow', async ({
    page,
  }) => {
    await page.evaluate(() => {
      localStorage.setItem('openrouter_pkce_verifier', 'test-verifier')
    })

    await page.goto('/openrouter-callback?code=test-auth-code')
    await page.waitForURL('/editor', { timeout: 15_000 })
    await waitForEditorReady(page)

    await page.getByRole('button', { name: 'Chat AI' }).click()
    await expect(
      page.getByPlaceholder('Type a message... (Enter to send)'),
    ).toBeVisible({ timeout: 10_000 })
  })

  test.describe('with OpenRouter authenticated', () => {
    test.beforeEach(async ({ page }) => {
      await injectOpenRouterKey(page, 'sk-or-test-key-12345')
    })

    test('should select an AI provider', async ({ page }) => {
      await page.getByRole('button', { name: 'Chat AI' }).click()

      await expect(
        page.getByPlaceholder('Type a message... (Enter to send)'),
      ).toBeVisible({ timeout: 10_000 })

      const modelSelect = page.locator('[role="dialog"]').getByRole('combobox')
      await expect(modelSelect).not.toHaveAttribute('aria-disabled', 'true', {
        timeout: 10_000,
      })
      await modelSelect.click()
      await expect(
        page.getByRole('option', { name: 'Llama 3.1 8B Instruct (free)' }),
      ).toBeVisible({ timeout: 10_000 })
      await page
        .getByRole('option', { name: 'Llama 3.1 8B Instruct (free)' })
        .click()

      await expect(
        page.locator('[role="dialog"]').getByRole('combobox'),
      ).toHaveText('Llama 3.1 8B Instruct (free)')
    })

    test('should add a file to the chat context', async ({ page }) => {
      await page.getByRole('button', { name: 'New File' }).click()
      await page.getByLabel('Nome do arquivo').fill('helper')
      await page.getByRole('button', { name: 'Criar' }).click()
      await expect(page.getByRole('tab', { name: /helper\.py/ })).toBeVisible()

      // Switch active file back to main.py so helper.py is not auto-selected as context
      await page
        .getByRole('tab', { name: /main\.py/ })
        .first()
        .click()

      await page.getByRole('button', { name: 'Chat AI' }).click()
      await expect(
        page.getByPlaceholder('Type a message... (Enter to send)'),
      ).toBeVisible({ timeout: 10_000 })

      const addFileButton = page.getByRole('button', {
        name: 'Add file context',
      })
      await expect(addFileButton).not.toBeDisabled({ timeout: 10_000 })
      await addFileButton.click()

      await expect(
        page.getByRole('menuitem', { name: /helper\.py/ }),
      ).toBeVisible({ timeout: 10_000 })
      await page.getByRole('menuitem', { name: /helper\.py/ }).click()

      await expect(
        page
          .locator('[role="dialog"]')
          .getByRole('tab', { name: /helper\.py/ }),
      ).toBeVisible()
    })

    test('should remove a file from the chat context', async ({ page }) => {
      await waitForEditorReady(page)
      await page.getByRole('button', { name: 'Chat AI' }).click()

      await expect(
        page.getByPlaceholder('Type a message... (Enter to send)'),
      ).toBeVisible({ timeout: 10_000 })

      await expect(
        page.locator('[role="dialog"]').getByRole('tab', { name: /main\.py/ }),
      ).toBeVisible()

      await page
        .locator('[role="dialog"]')
        .getByRole('tab', { name: /main\.py/ })
        .locator('.MuiIconButton-root')
        .click()

      await expect(
        page.locator('[role="dialog"]').getByRole('tab', { name: /main\.py/ }),
      ).not.toBeVisible()
    })

    test('should send a message in the chat', async ({ page }) => {
      await page.getByRole('button', { name: 'Chat AI' }).click()

      await expect(
        page.getByPlaceholder('Type a message... (Enter to send)'),
      ).toBeVisible({ timeout: 10_000 })

      const modelSelect = page.locator('[role="dialog"]').getByRole('combobox')
      await expect(modelSelect).not.toHaveAttribute('aria-disabled', 'true', {
        timeout: 10_000,
      })
      await modelSelect.click()
      await expect(
        page.getByRole('option', { name: 'Llama 3.1 8B Instruct (free)' }),
      ).toBeVisible({ timeout: 10_000 })
      await page
        .getByRole('option', { name: 'Llama 3.1 8B Instruct (free)' })
        .click()

      await page
        .getByPlaceholder('Type a message... (Enter to send)')
        .fill('Hello, can you help me?')
      await page.keyboard.press('Enter')

      await expect(page.getByText('Hello, can you help me?')).toBeVisible({
        timeout: 10_000,
      })

      await expect(
        page.getByText('Hello! I can help with Python.'),
      ).toBeVisible({ timeout: 15_000 })
    })

    test('should create a new chat session', async ({ page }) => {
      await page.getByRole('button', { name: 'Chat AI' }).click()

      await expect(
        page.getByPlaceholder('Type a message... (Enter to send)'),
      ).toBeVisible({ timeout: 10_000 })

      const modelSelect = page.locator('[role="dialog"]').getByRole('combobox')
      await expect(modelSelect).not.toHaveAttribute('aria-disabled', 'true', {
        timeout: 10_000,
      })
      await modelSelect.click()
      await expect(
        page.getByRole('option', { name: 'Llama 3.1 8B Instruct (free)' }),
      ).toBeVisible({ timeout: 10_000 })
      await page
        .getByRole('option', { name: 'Llama 3.1 8B Instruct (free)' })
        .click()

      await page
        .getByPlaceholder('Type a message... (Enter to send)')
        .fill('First session message')
      await page.keyboard.press('Enter')

      await expect(
        page.getByText('Hello! I can help with Python.'),
      ).toBeVisible({ timeout: 15_000 })

      await page.getByRole('button', { name: 'New session' }).click()

      await expect(
        page.getByText('Send a message to start the conversation.'),
      ).toBeVisible()
    })

    test('should load a previous chat session', async ({ page }) => {
      await page.getByRole('button', { name: 'Chat AI' }).click()

      await expect(
        page.getByPlaceholder('Type a message... (Enter to send)'),
      ).toBeVisible({ timeout: 10_000 })

      const modelSelect = page.locator('[role="dialog"]').getByRole('combobox')
      await expect(modelSelect).not.toHaveAttribute('aria-disabled', 'true', {
        timeout: 10_000,
      })
      await modelSelect.click()
      await expect(
        page.getByRole('option', { name: 'Llama 3.1 8B Instruct (free)' }),
      ).toBeVisible({ timeout: 10_000 })
      await page
        .getByRole('option', { name: 'Llama 3.1 8B Instruct (free)' })
        .click()

      const uniqueMessage = `session-${randomUUID().slice(0, 8)}`
      await page
        .getByPlaceholder('Type a message... (Enter to send)')
        .fill(uniqueMessage)
      await page.keyboard.press('Enter')

      await expect(
        page.getByText('Hello! I can help with Python.'),
      ).toBeVisible({ timeout: 15_000 })

      const sessionTitleLocator = page.locator('[role="dialog"] h2 strong')
      await expect(sessionTitleLocator).not.toHaveText('Untitled', {
        timeout: 5_000,
      })
      const sessionTitle = await sessionTitleLocator.textContent()

      await page.getByRole('button', { name: 'New session' }).click()
      await expect(
        page.getByText('Send a message to start the conversation.'),
      ).toBeVisible()

      await page.getByRole('button', { name: 'Session history' }).click()

      await expect(page.getByRole('dialog', { name: 'Sessions' })).toBeVisible()

      await page.getByText(sessionTitle!).click()

      await expect(
        page.getByTestId('chat-messages').getByText(uniqueMessage),
      ).toBeVisible()
    })

    test('should delete a chat session', async ({ page }) => {
      await page.getByRole('button', { name: 'Chat AI' }).click()

      await expect(
        page.getByPlaceholder('Type a message... (Enter to send)'),
      ).toBeVisible({ timeout: 10_000 })

      const modelSelect = page.locator('[role="dialog"]').getByRole('combobox')
      await expect(modelSelect).not.toHaveAttribute('aria-disabled', 'true', {
        timeout: 10_000,
      })
      await modelSelect.click()
      await expect(
        page.getByRole('option', { name: 'Llama 3.1 8B Instruct (free)' }),
      ).toBeVisible({ timeout: 10_000 })
      await page
        .getByRole('option', { name: 'Llama 3.1 8B Instruct (free)' })
        .click()

      await page
        .getByPlaceholder('Type a message... (Enter to send)')
        .fill('Session to delete')
      await page.keyboard.press('Enter')

      await expect(
        page.getByText('Hello! I can help with Python.'),
      ).toBeVisible({ timeout: 15_000 })

      await page.getByRole('button', { name: 'Session history' }).click()

      await expect(page.getByRole('dialog', { name: 'Sessions' })).toBeVisible()

      await page.getByRole('button', { name: 'Delete session' }).first().click()

      await expect(
        page.getByText('No sessions yet. Start a conversation to create one.'),
      ).toBeVisible()
    })
  })
})
