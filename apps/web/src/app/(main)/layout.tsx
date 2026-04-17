'use client'
import { Header } from '@/components/Header'
import { Loading } from './components/Loading'
import { setAccessToken } from '@/utils/access-token-store'
import { trpc } from '@/utils/trpc'
import { Container } from '@mui/material'
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
    return <Loading />
  }

  return (
    <>
      <Header />
      <Container
        component="main"
        maxWidth={false}
        sx={{ mt: 2, minHeight: '100%' }}
      >
        {children}
      </Container>
    </>
  )
}
