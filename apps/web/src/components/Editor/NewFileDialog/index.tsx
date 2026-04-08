import { AlertContext } from '@/context/AlertContext'
import { useEditor } from '@/hooks/useEditor'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'

import { type newFileDTO, newFileSchema } from '@python-editor/schemas/new-file'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'

interface NewFileDialogProps {
  open: boolean
  onClose: () => void
}

export function NewFileDialog({ open, onClose }: NewFileDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<newFileDTO>({
    resolver: zodResolver(newFileSchema),
  })

  const { newFile } = useEditor()
  const alert = useContext(AlertContext)

  function handleSubmitForm(data: newFileDTO) {
    try {
      newFile(data.fileName)
      onClose()
      reset()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'An error occurred while creating the file.'
      alert.error(message)
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
      <DialogTitle>New File</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Nome do arquivo"
          placeholder="ex: utils"
          sx={{ mt: 1 }}
          error={!!errors.fileName}
          helperText={
            errors.fileName?.message ??
            'A extensão .py será adicionada automaticamente.'
          }
          {...register('fileName')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={isSubmitting}
        >
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
