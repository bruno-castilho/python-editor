'use client'
import { Box, Button, Card, CircularProgress, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { trpc } from '@/utils/trpc'
import { AppError } from '../error'

export default function Page() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token)
    throw new AppError('Verification token not found in the URL.', 400)

  const router = useRouter()

  const {
    mutate: verifyEmailMutate,
    isPending: isPendingVerifyEmail,
    error,
  } = useMutation(trpc.users.verifyEmail.mutationOptions())

  useEffect(() => {
    verifyEmailMutate({ token })
  }, [token])

  if (error) {
    const statusCode = error?.data?.httpStatus ?? 500
    throw new AppError(error.message, statusCode)
  }

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
        {isPendingVerifyEmail && (
          <>
            <CircularProgress />
            <Typography>Verifying your email...</Typography>
          </>
        )}

        {!isPendingVerifyEmail && (
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
      </Box>
    </Box>
  )
}
