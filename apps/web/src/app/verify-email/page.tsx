'use client'
import { Box, Button, Card, CircularProgress, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { trpc } from '@/utils/trpc'

type Status = 'loading' | 'success' | 'error'

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const { mutateAsync: verifyEmail } = useMutation(
    trpc.users.verifyEmail.mutationOptions(),
  )

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Verification token not found in the URL.')
      return
    }

    verifyEmail({ token })
      .then(() => setStatus('success'))
      .catch((e) => {
        setStatus('error')
        setErrorMessage(
          e instanceof Error ? e.message : 'Error verifying email.',
        )
      })
  }, [token])

  return (
    <Box
      component="main"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding={2}
    >
      <Box
        variant="outlined"
        component={Card}
        width={{ xs: 300, sm: 400 }}
        padding={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={3}
      >
        {status === 'loading' && (
          <>
            <CircularProgress />
            <Typography>Verifying your email...</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <Typography component="h1" variant="h5" textAlign="center">
              Email verified successfully!
            </Typography>
            <Typography textAlign="center" color="text.secondary">
              Your account is active. You can now sign in.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push('/sign-in')}
            >
              Sign in
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Typography component="h1" variant="h5" textAlign="center">
              Invalid or expired link
            </Typography>
            <Typography textAlign="center" color="text.secondary">
              {errorMessage}
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push('/sign-in')}
            >
              Back to sign in
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}
