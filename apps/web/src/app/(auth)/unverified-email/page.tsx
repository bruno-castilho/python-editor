'use client'
import { Box, Button, Card, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContext, useEffect, useRef, useState } from 'react'
import { trpc } from '@/utils/trpc'
import { AlertContext } from '@/context/AlertContext'
import { AppError } from '@/app/error'

const RESEND_COOLDOWN_SECONDS = 60

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export default function Page() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  if (!email) throw new AppError('No email address was provided', 400)

  const router = useRouter()

  const alert = useContext(AlertContext)

  const [countdownSeconds, setCountdownSeconds] = useState(0)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  )

  const {
    mutate: resendEmailVerificationMutate,
    mutateAsync: resendEmailVerificationMutateAsync,
    isPending: isPendingResendEmailVerification,
  } = useMutation(
    trpc.users.resendVerificationEmail.mutationOptions({
      onError: (error) => {
        alert.error(
          error instanceof Error
            ? error.message
            : 'Failed to resend verification email.',
        )
      },
    }),
  )

  function startCountdown() {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }

    setCountdownSeconds(RESEND_COOLDOWN_SECONDS)

    countdownIntervalRef.current = setInterval(() => {
      setCountdownSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(countdownIntervalRef.current!)
          countdownIntervalRef.current = null
          return 0
        }
        return previous - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (!email) return

    resendEmailVerificationMutateAsync({ email })
      .then(() => startCountdown())
      .catch(() => startCountdown())

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

  function handleResendEmail() {
    if (!email) return

    resendEmailVerificationMutate(
      { email },
      {
        onSuccess: () => {
          alert.success('Verification email resent successfully.')
          startCountdown()
        },
      },
    )
  }

  function handleNavigateToSignIn() {
    router.push('/sign-in')
  }

  const isResendDisabled =
    isPendingResendEmailVerification || countdownSeconds > 0

  return (
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
      <>
        <Typography component="h1" variant="h5" textAlign="center">
          Verify your email
        </Typography>
        <Typography textAlign="center" color="text.secondary">
          We sent a verification link to <strong>{email}</strong>. Please check
          your inbox and click the link to activate your account.
        </Typography>
        {countdownSeconds > 0 && (
          <Typography variant="body2" color="text.secondary">
            Resend available in {formatCountdown(countdownSeconds)}
          </Typography>
        )}
        <Button
          variant="contained"
          fullWidth
          disabled={isResendDisabled}
          onClick={handleResendEmail}
          color="secondary"
        >
          Resend verification email
        </Button>
        <Button variant="text" fullWidth onClick={handleNavigateToSignIn}>
          Back to sign in
        </Button>
      </>
    </Box>
  )
}
