'use client'
import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type ResetPasswordDTO,
  resetPasswordSchema,
} from '@python-editor/schemas/reset-password'
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'
import { useContext } from 'react'
import { AlertContext } from '@/context/AlertContext'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const alert = useContext(AlertContext)
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const { mutateAsync } = useMutation(trpc.user.resetPassword.mutationOptions())

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordDTO>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  })

  async function handleSubmitForm(data: ResetPasswordDTO) {
    try {
      const { message } = await mutateAsync(data)
      reset()
      alert.success(message)
      router.push('/sign-in')
    } catch (e) {
      alert.error(e instanceof Error ? e.message : 'Error resetting password')
    }
  }

  if (!token) {
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
          gap={2}
        >
          <Typography component="h1" variant="h4" textAlign="center">
            Invalid link
          </Typography>
          <Typography textAlign="center" color="text.secondary">
            The reset token was not found in the URL.
          </Typography>
        </Box>
      </Box>
    )
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
        gap={2}
      >
        <Typography component="h1" variant="h4">
          Reset password
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
            <FormLabel htmlFor="password">New password</FormLabel>
            <TextField
              size="small"
              id="password"
              type="password"
              placeholder="••••••"
              autoFocus
              required
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password?.message ?? ''}
              {...register('password')}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="repeatPassword">Confirm new password</FormLabel>
            <TextField
              size="small"
              id="repeatPassword"
              type="password"
              placeholder="••••••"
              required
              fullWidth
              variant="outlined"
              error={!!errors.repeatPassword}
              helperText={errors.repeatPassword?.message ?? ''}
              {...register('repeatPassword')}
            />
          </FormControl>
          <Button
            type="submit"
            size="small"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
          >
            Reset password
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
