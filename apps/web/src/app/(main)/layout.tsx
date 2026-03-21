'use client'
import { Header } from '@/components/Header'
import { setAccessToken } from '@/utils/access-token-store'
import { trpc } from '@/utils/trpc'
import { Box, CircularProgress, Container } from '@mui/material'
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
      <Box>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Header />
      <Container
        component="main"
        maxWidth="xl"
        sx={{ mt: 2, minHeight: '100%' }}
      >
        {children}
      </Container>
    </>
  )
}
