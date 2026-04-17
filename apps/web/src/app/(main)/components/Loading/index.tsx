'use client'
import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { PythonLoader } from '@/components/PythonLoader'

const LOADING_MESSAGES = [
  'Importing os, sys, random...',
  'Running __init__.py...',
  'Compiling bytecode...',
  'Connecting to the runtime...',
  'Resolving dependencies...',
  'Spawning worker threads...',
  'Warming up the interpreter...',
  'Loading standard library...',
]

interface LoadingProps {
  size?: number
}

export function Loading({ size = 96 }: LoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setMessageIndex((previousIndex) => (previousIndex + 1) % LOADING_MESSAGES.length)
        setVisible(true)
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
      <PythonLoader size={size} />
      <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          variant="h6"
          sx={{ color: 'primary.main', fontFamily: 'monospace', letterSpacing: 1 }}
        >
          Initializing environment...
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
          {'> '}{currentMessage}
        </Typography>
      </Box>
    </Box>
  )
}
