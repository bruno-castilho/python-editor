import type { Page, Request, Route } from '@playwright/test'

export class MockOpenrouter {
  async install(page: Page): Promise<void> {
    await page.route(
      (url) => url.hostname === 'openrouter.ai',
      async (route, request) => {
        const url = new URL(request.url())

        await this.handle(route, request, url)
      },
    )
  }

  private async handle(route: Route, request: Request, url: URL) {
    if (url.pathname === '/api/v1/chat/completions') {
      await this.chatCompletions(route)
      return
    }

    if (url.pathname === '/api/v1/models') {
      await this.models(route)
      return
    }

    if (url.pathname === '/api/v1/auth/keys') {
      await this.authKeys(route)
      return
    }

    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        error: `No mock for ${request.method()} ${url.pathname}`,
      }),
    })
  }

  private async chatCompletions(route: Route) {
    const chunkBase = {
      id: 'chatcmpl-test',
      object: 'chat.completion.chunk',
      created: 1712361600,
      model: 'meta-llama/llama-3.1-8b-instruct:free',
    }
    const streamBody = [
      `data: ${JSON.stringify({ ...chunkBase, choices: [{ index: 0, delta: { role: 'assistant', content: 'Hello! I can help with Python.' }, finish_reason: null }] })}`,
      '',
      `data: ${JSON.stringify({ ...chunkBase, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] })}`,
      '',
      'data: [DONE]',
      '',
      '',
    ].join('\n')

    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: { 'cache-control': 'no-cache', connection: 'keep-alive' },
      body: streamBody,
    })
  }

  private async models(route: Route) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'meta-llama/llama-3.1-8b-instruct:free',
            canonical_slug: 'llama-3.1-8b-instruct:free',
            name: 'Llama 3.1 8B Instruct (free)',
            created: 1712361600,
            description: 'Meta: Llama 3.1 8B Instruct (free)',
            context_length: 131072,
            architecture: {
              modality: 'text->text',
              input_modalities: ['text'],
              output_modalities: ['text'],
            },
            pricing: {
              prompt: '0',
              completion: '0',
            },
            top_provider: {
              is_moderated: false,
            },
            per_request_limits: null,
            supported_parameters: ['temperature', 'top_p', 'max_tokens'],
            default_parameters: null,
          },
        ],
      }),
    })
  }

  private async authKeys(route: Route) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ key: 'sk-or-test-key-12345' }),
    })
  }
}
