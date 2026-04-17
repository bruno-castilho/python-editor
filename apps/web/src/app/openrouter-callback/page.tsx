'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthOpenRouter } from '@/hooks/useAuthOpenRouter'
import { AppError } from '../error'
import { Loading } from '@/components/Loading'

export default function OpenRouterCallbackPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  if (!code)
    throw new AppError('No authorization code received from OpenRouter.', 400)

  const [error, setError] = useState<AppError | null>(null)
  const router = useRouter()

  const { exchangeOpenRouterCode, saveOpenRouterKey } = useAuthOpenRouter()

  async function handleOpenRouterCallback() {
    try {
      const { key } = await exchangeOpenRouterCode(code as string)
      saveOpenRouterKey(key)
      router.replace('/editor')
    } catch {
      setError(
        new AppError(
          'An error occurred while processing the OpenRouter callback.',
          500,
        ),
      )
    }
  }

  useEffect(() => {
    handleOpenRouterCallback()
  }, [searchParams])

  if (error) throw error

  return (
    <Loading
      messagesTitle="Authenticating with OpenRouter..."
      loadingMessages={[
        'Connecting to OpenRouter...',
        'Exchanging authorization code...',
        'Validating credentials...',
        'Retrieving API key...',
        'Securing your session...',
        'Finalizing authentication...',
      ]}
    />
  )
}
