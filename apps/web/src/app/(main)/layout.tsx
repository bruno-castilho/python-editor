'use client'
import { Header } from '@/components/Header'
import { Loading } from '@/components/Loading'
import { setAccessToken } from '@/utils/access-token-store'
import { trpc } from '@/utils/trpc'
import { Box, Container } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { mutate: sessionRefreshMutate, status: statussessionRefresh } =
    useMutation(
      trpc.auth.sessionRefresh.mutationOptions({
        onSuccess(data) {
          setAccessToken(data?.accessToken || '')
        },
      }),
    )

  useEffect(() => {
    sessionRefreshMutate()
  }, [])

  if (statussessionRefresh === 'idle' || statussessionRefresh === 'pending') {
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
            messagesTitle="Initializing environment..."
            loadingMessages={[
              'Importing os, sys, random...',
              'Running __init__.py...',
              'Compiling bytecode...',
              'Connecting to the runtime...',
              'Resolving dependencies...',
              'Spawning worker threads...',
              'Warming up the interpreter...',
              'Loading standard library...',
            ]}
          />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <Header />
      <Container component="main" maxWidth={false} sx={{ flex: 1 }}>
        {children}
      </Container>
    </Box>
  )
}
