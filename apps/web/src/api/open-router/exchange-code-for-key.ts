import { openRouter } from '@/lib/axios'

interface ExchangeCodeForKeyParams {
  code: string
  verifier: string
  challengeMethod: string
}

interface ExchangeCodeForKeyResponse {
  key: string
}

export async function exchangeCodeForKey(params: ExchangeCodeForKeyParams) {
  const { code, verifier, challengeMethod } = params

  const response = await openRouter.post<ExchangeCodeForKeyResponse>(
    '/v1/auth/keys',
    {
      code,
      code_verifier: verifier,
      code_challenge_method: challengeMethod,
    },
  )

  return response.data
}
