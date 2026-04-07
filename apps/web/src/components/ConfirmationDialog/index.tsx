import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

interface ConfirmationDialogProps {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmationDialog({
  open,
  title,
  description,
  onConfirm,
  onClose,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Disagree</Button>
        <Button onClick={onConfirm} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  )
}
