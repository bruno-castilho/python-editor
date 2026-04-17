import { PythonLoader } from '@/components/PythonLoader'
import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

const LOADING_MESSAGES = [
  'Connecting to OpenRouter...',
  'Exchanging authorization code...',
  'Validating credentials...',
  'Retrieving API key...',
  'Securing your session...',
  'Finalizing authentication...',
]

export function Loading() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [messageVisible, setMessageVisible] = useState(true)

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
