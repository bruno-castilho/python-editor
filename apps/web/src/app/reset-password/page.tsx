'use client'
import {
  Avatar,
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
import { AppError } from '../error'
import { LockReset } from '@mui/icons-material'

export default function Page() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  if (!token)
    throw new AppError('The reset token was not found in the URL.', 400)

  const router = useRouter()
  const alert = useContext(AlertContext)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordDTO>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  })

  const { mutate: resetPasswordMutate, isPending: isPendingResetPassword } =
    useMutation(
      trpc.users.resetPassword.mutationOptions({
        onSuccess: ({ message }) => {
          alert.success(message)
          router.push('/sign-in')
        },
        onError: ({ message }) => {
          alert.error(message)
        },
      }),
    )

  async function handleSubmitForm(data: ResetPasswordDTO) {
    resetPasswordMutate(data)
  }

  return (
    <Box
      component="main"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
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
            <LockReset />
          </Avatar>

          <Typography component="h1" variant="h5">
            Reset password
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
            loading={isSubmitting || isPendingResetPassword}
            loadingPosition="start"
          >
            Reset password
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
