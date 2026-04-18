'use client'
import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { PythonLoader } from '@/components/PythonLoader'

interface LoadingProps {
  messagesTitle: string
  loadingMessages: string[]
}

export function Loading({ messagesTitle, loadingMessages }: LoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setMessageIndex(
          (previousIndex) => (previousIndex + 1) % loadingMessages.length,
        )
        setVisible(true)
      }, 300)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const currentMessage = loadingMessages[messageIndex] ?? loadingMessages[0]

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
          {messagesTitle}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            color: 'text.secondary',
            opacity: visible ? 1 : 0,
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
