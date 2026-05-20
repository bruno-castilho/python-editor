'use client'
import { Avatar, Box, Button, Card, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useContext, useEffect, useRef, useState } from 'react'
import { trpc } from '@/utils/trpc'
import { AlertContext } from '@/context/AlertContext'
import { MarkEmailRead } from '@mui/icons-material'

const RESEND_COOLDOWN_SECONDS = 60

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function UnverifiedEmailContent({ email }: { email: string }) {
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
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        width: {
          xs: 350,
          sm: 450,
        },
        p: 4,
        gap: 2,
      }}
    >
      <>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          mb={2}
        >
          <Avatar
            sx={(theme) => ({
              bgcolor: theme.palette.secondary.main,
            })}
          >
            <MarkEmailRead />
          </Avatar>

          <Typography component="h1" variant="h5">
            Verify your email
          </Typography>
        </Box>

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
