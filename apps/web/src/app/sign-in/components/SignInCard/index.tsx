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
} from '@mui/material'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { type SignInDTO, signInSchema } from '@python-editor/schemas/sign-in'
import Link from 'next/link'
import { useContext, useState } from 'react'
import { AlertContext } from '@/context/AlertContext'
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'
import { useRouter } from 'next/navigation'
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog'
import { setAccessToken } from '@/utils/access-token-store'

export function SignInCard() {
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] =
    useState(false)

  const router = useRouter()
  const alert = useContext(AlertContext)
  const { mutateAsync } = useMutation(trpc.auth.signIn.mutationOptions())

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<SignInDTO>({
    resolver: zodResolver(signInSchema),
  })

  async function handleSubmitForm(data: SignInDTO) {
    try {
      const { message, accessToken } = await mutateAsync(data)
      reset()
      setAccessToken(accessToken)
      alert.success(message)
      router.push('/')
    } catch (e) {
      console.log(e)
      alert.error(e instanceof Error ? e.message : 'Login error')
    }
  }

  function handleForgotPasswordDialog() {
    setOpenForgotPasswordDialog((open) => !open)
  }

  return (
    <>
      <Box
        variant="outlined"
        component={Card}
        maxWidth={450}
        minWidth={300}
        padding={4}
        gap={2}
      >
        <Typography component="h1" variant="h4">
          Sign in
        </Typography>
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
            disabled={isSubmitting}
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
              href="/register"
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
    </>
  )
}
