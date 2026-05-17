import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function waitForEditorReady(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: 'Run' })).toBeVisible({
    timeout: 30_000,
  })

  // Wait for Monaco to mount via CDN loader and set window.monaco.
  // The editorRef is only set inside handleEditorMount, which fires after
  // Monaco finishes loading — codeExecution() returns early when editorRef
  // is null, so we must guarantee Monaco is ready before clicking Run.
  await page.waitForFunction(
    () => {
      const editors = (
        window as Window & {
          monaco?: {
            editor?: { getEditors?: () => unknown[] }
          }
        }
      ).monaco?.editor?.getEditors?.()
      return (editors?.length ?? 0) > 0
    },
    { timeout: 30_000 },
  )
}
