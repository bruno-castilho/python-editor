'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthOpenRouter } from '@/hooks/useAuthOpenRouter'
import { Box } from '@mui/material'
import { Loading } from '@/components/Loading'
import { AppError } from '@/errors/app-error'

export function OpenRouterCallback({ code }: { code: string }) {
  const router = useRouter()
  const { exchangeOpenRouterCode, saveOpenRouterKey } = useAuthOpenRouter()
  const [error, setError] = useState<AppError | null>(null)

  if (error) throw error

  useEffect(() => {
    exchangeOpenRouterCode(code)
      .then(({ key }) => {
        saveOpenRouterKey(key)
        router.replace('/editor')
      })
      .catch(() => {
        setError(
          new AppError(
            'An error occurred while processing the OpenRouter callback.',
            500,
          ),
        )
      })
  }, [code, exchangeOpenRouterCode, saveOpenRouterKey, router])

  return (
    <Box sx={{ height: '100dvh' }}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
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
      </Box>
    </Box>
  )
}
