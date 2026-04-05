import { OpenRouter } from '@openrouter/sdk'

export function makeOpenRouter(apiKey: string) {
  return new OpenRouter({
    apiKey,
    appTitle: 'python-editor',
    httpReferer: 'http://localhost:3001/',
  })
}
