'use client'
import { Header } from '@/components/Header'
import { setAccessToken } from '@/utils/access-token-store'
import { trpc } from '@/utils/trpc'
import { Box, CircularProgress } from '@mui/material'
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Header />
      <Box
        component="main"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        margin={2}
      >
        {children}
      </Box>
    </>
  )
}
