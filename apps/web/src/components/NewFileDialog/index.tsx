import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'

import { type newFileDTO, newFile } from '@python-editor/schemas/new-file'
import { useForm } from 'react-hook-form'

interface NewFileDialogProps {
  open: boolean
  onClose: () => void
  handleNewFile: (name: string) => void
}

export function NewFileDialog({
  open,
  onClose,
  handleNewFile,
}: NewFileDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<newFileDTO>({
    resolver: zodResolver(newFile),
  })

  function handleSubmitForm(data: newFileDTO) {
    handleNewFile(data.fileName)
    onClose()
    reset()
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
