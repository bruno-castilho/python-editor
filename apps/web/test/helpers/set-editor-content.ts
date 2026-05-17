import type { Page } from '@playwright/test'

export async function setEditorContent(
  page: Page,
  code: string,
): Promise<void> {
  const editorFound = await page.evaluate((newCode: string) => {
    type EditorInstance = { setValue: (value: string) => void }
    type MonacoWindow = Window & {
      monaco?: { editor?: { getEditors?: () => EditorInstance[] } }
    }
    const editors = (window as MonacoWindow).monaco?.editor?.getEditors?.()
    if (!editors?.[0]) return false
    editors[0].setValue(newCode)
    return true
  }, code)

  if (!editorFound) {
    throw new Error(
      'Monaco editor not found via window.monaco — call waitForEditorReady first',
    )
  }
}
