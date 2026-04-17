'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Button, Typography } from '@mui/material'
import { useAuthOpenRouter } from '@/hooks/useAuthOpenRouter'
import { PythonLoader } from '@/components/PythonLoader'

const LOADING_MESSAGES = [
  'Connecting to OpenRouter...',
  'Exchanging authorization code...',
  'Validating credentials...',
  'Retrieving API key...',
  'Securing your session...',
  'Finalizing authentication...',
]

export default function OpenRouterCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)
  const [messageVisible, setMessageVisible] = useState(true)
  const { exchangeOpenRouterCode, saveOpenRouterKey } = useAuthOpenRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageVisible(false)
      setTimeout(() => {
        setMessageIndex(
          (previousIndex) => (previousIndex + 1) % LOADING_MESSAGES.length,
        )
        setMessageVisible(true)
      }, 300)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  async function handleOpenRouterCallback() {
    try {
      const code = searchParams.get('code')

      if (!code) {
        setError('No authorization code received from OpenRouter.')
        return
      }

      const { key } = await exchangeOpenRouterCode(code)
      saveOpenRouterKey(key)
      router.replace('/editor')
    } catch {
      setError(
        'An error occurred while processing the OpenRouter callback. Please try again.',
      )
    }
  }

  useEffect(() => {
    handleOpenRouterCallback()
  }, [searchParams])

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 4,
        }}
      >
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => window.close()}>
          Close
        </Button>
      </Box>
    )
  }

  const currentMessage = LOADING_MESSAGES[messageIndex] ?? LOADING_MESSAGES[0]

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 3,
      }}
    >
      <PythonLoader />
      <Box
        sx={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'primary.main',
            fontFamily: 'monospace',
            letterSpacing: 1,
          }}
        >
          Authenticating with OpenRouter...
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            color: 'text.secondary',
            opacity: messageVisible ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            minHeight: '1.5em',
          }}
        >
          {'> '}
          {currentMessage}
        </Typography>
      </Box>
    </Box>
  )
}
