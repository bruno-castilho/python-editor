'use client'
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Link as LinkMUI,
  Card,
  Avatar,
} from '@mui/material'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { type SignInDTO, signInSchema } from '@python-editor/schemas/sign-in'
import Link from 'next/link'
import { useContext, useRef, useState } from 'react'
import { AlertContext } from '@/context/AlertContext'
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'
import { useRouter } from 'next/navigation'
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog'
import { setAccessToken } from '@/utils/access-token-store'
import { Login } from '@mui/icons-material'

export function SignInCard() {
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] =
    useState(false)

  const router = useRouter()
  const alert = useContext(AlertContext)
  const lastSubmittedEmail = useRef('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<SignInDTO>({
    resolver: zodResolver(signInSchema),
  })

  const { mutate: signInMutate, isPending: isPendingSignIn } = useMutation(
    trpc.auth.signIn.mutationOptions({
      onSuccess: ({ message, accessToken }) => {
        setAccessToken(accessToken)
        alert.success(message)
        router.push('/editor')
        reset()
      },
      onError: (error) => {
        if (error.data?.code === 'FORBIDDEN') {
          router.push(
            `/unverified-email?email=${encodeURIComponent(lastSubmittedEmail.current)}`,
          )

          return
        }

        alert.error(error instanceof Error ? error.message : 'Login error')
      },
    }),
  )

  function handleSubmitForm(data: SignInDTO) {
    lastSubmittedEmail.current = data.email
    signInMutate(data)
  }

  function handleForgotPasswordDialog() {
    setOpenForgotPasswordDialog((open) => !open)
  }

  return (
    <Box>
      <Box
        variant="outlined"
        component={Card}
        sx={{
          width: {
            xs: 350,
            sm: 450,
          },
          p: 4,
          gap: 2,
        }}
      >
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
            <Login />
          </Avatar>

          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit(handleSubmitForm)}
          display="flex"
          flexDirection="column"
          width="100%"
          gap={2}
        >
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              size="small"
              id="email"
              type="email"
              placeholder="your@email.com"
              autoFocus
              required
              fullWidth
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email?.message ?? ''}
              {...register('email')}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              size="small"
              placeholder="••••••"
              type="password"
              id="password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password?.message ?? ''}
              {...register('password')}
            />
          </FormControl>

          <Button
            type="submit"
            size="small"
            fullWidth
            variant="contained"
            loading={isSubmitting || isPendingSignIn}
            loadingPosition="start"
            color="secondary"
          >
            Sign in
          </Button>
          <LinkMUI
            component="button"
            type="button"
            variant="body2"
            alignSelf="center"
            color="primary"
            onClick={handleForgotPasswordDialog}
          >
            Forgot your password?
          </LinkMUI>
        </Box>
        <Divider>or</Divider>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography textAlign="center">
            Don't have an account?{' '}
            <LinkMUI
              variant="body2"
              textAlign="center"
              component={Link}
              href="/sign-up"
              color="primary"
            >
              Sign up
            </LinkMUI>
          </Typography>
        </Box>
      </Box>
      <ForgotPasswordDialog
        open={openForgotPasswordDialog}
        onClose={handleForgotPasswordDialog}
      />
    </Box>
  )
}
