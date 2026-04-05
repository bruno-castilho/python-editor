'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useAuthOpenRouter } from '@/hooks/useAuthOpenRouter'

export default function OpenRouterCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { exchangeOpenRouterCode, saveOpenRouterKey } = useAuthOpenRouter()

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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">
        Completing authentication...
      </Typography>
    </Box>
  )
}
