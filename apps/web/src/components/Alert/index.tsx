'use client'
import { Alert as AlertMUI, Snackbar } from '@mui/material'
import { useContext } from 'react'
import { AlertContext } from '../../context/AlertContext'

export function Alert() {
  const { open, severity, onClose, message } = useContext(AlertContext)

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={open}
      autoHideDuration={3000}
      transitionDuration={{ enter: 500, exit: 250 }}
      onClose={onClose}
    >
      <AlertMUI
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </AlertMUI>
    </Snackbar>
  )
}
