import { AlertContext } from '@/context/AlertContext'
import { trpc } from '@/utils/trpc'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'
import {
  forgotPasswordSchema,
  type ForgotPasswordDTO,
} from '@python-editor/schemas/forgot-password'
import { useMutation } from '@tanstack/react-query'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'

interface ForgotPasswordDialogProps {
  open: boolean
  onClose: () => void
}

export function ForgotPasswordDialog({
  open,
  onClose,
}: ForgotPasswordDialogProps) {
  const alert = useContext(AlertContext)
  const { mutateAsync } = useMutation(
    trpc.users.forgotPassword.mutationOptions(),
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ForgotPasswordDTO>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function handleSubmitForm(data: ForgotPasswordDTO) {
    try {
      const { message } = await mutateAsync(data)
      reset()
      onClose()
      alert.success(message)
    } catch (e) {
      alert.error(
        e instanceof Error ? e.message : 'Error requesting a password reset',
      )
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      component="form"
      onSubmit={handleSubmit(handleSubmitForm)}
    >
      <DialogTitle>Forgot Password</DialogTitle>

      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText>
          Enter the email associated with your account and we&apos;ll send you a
          link to reset your password.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="email"
          placeholder="your@email.com"
          sx={{ mt: 1 }}
          error={!!errors.email}
          helperText={errors.email?.message ?? ''}
          {...register('email')}
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}
