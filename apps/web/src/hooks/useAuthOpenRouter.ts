import { exchangeCodeForKey } from '@/api/open-router/exchange-code-for-key'

function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)

  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function createSHA256CodeChallenge(input: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)

  const hash = await crypto.subtle.digest('SHA-256', data)

  return base64UrlEncode(hash)
}

function generateRandomString(length = 64) {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'

  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)

  return Array.from(randomValues)
    .map((v) => charset[v % charset.length])
    .join('')
}

async function generatePKCE() {
  const codeVerifier = generateRandomString()

  const codeChallenge = await createSHA256CodeChallenge(codeVerifier)

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  }
}

export function useAuthOpenRouter() {
  async function startOpenRouterAuth() {
    const { codeVerifier, codeChallenge } = await generatePKCE()

    sessionStorage.setItem('openrouter_pkce_verifier', codeVerifier)

    const callback = encodeURIComponent(
      window.location.origin + '/openrouter-callback',
    )

    window.location.href =
      `https://openrouter.ai/auth` +
      `?callback_url=${callback}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`
  }

  async function exchangeOpenRouterCode(code: string) {
    const verifier = sessionStorage.getItem('openrouter_pkce_verifier')

    if (!verifier) {
      throw new Error('PKCE verifier not found')
    }

    const { key } = await exchangeCodeForKey({
      code,
      verifier,
      challengeMethod: 'S256',
    })

    return { key }
  }

  function saveOpenRouterKey(key: string) {
    localStorage.setItem('openrouter_api_key', key)
  }

  function getOpenRouterKey() {
    return localStorage.getItem('openrouter_api_key')
  }

  return {
    startOpenRouterAuth,
    exchangeOpenRouterCode,
    saveOpenRouterKey,
    getOpenRouterKey,
  }
}
