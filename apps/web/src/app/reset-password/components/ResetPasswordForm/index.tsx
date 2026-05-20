'use client'
import { AlertContext } from '@/context/AlertContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, FormControl, FormLabel, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import {
  type ResetPasswordDTO,
  resetPasswordSchema,
} from '@python-editor/schemas/reset-password'
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'
import { useContext } from 'react'
import { useRouter } from 'next/navigation'

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
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
  )
}
