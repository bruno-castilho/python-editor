'use client'
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import { ChatAgent } from './ChatAgent'
import { ChatAgentAuth } from './ChatAgentAuth'
import { useAuthOpenRouter } from '@/hooks/useAuthOpenRouter'

interface ChatAgentDialogProps {
  open: boolean
  onClose: () => void
}

export function ChatAgentDialog({ open, onClose }: ChatAgentDialogProps) {
  const { getOpenRouterKey } = useAuthOpenRouter()

  const apiKey = getOpenRouterKey()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        Chat AI
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden',
          p: 0,
        }}
      >
        {!apiKey && <ChatAgentAuth />}
        {!!apiKey && <ChatAgent apiKey={apiKey} open={open} />}
      </DialogContent>
    </Dialog>
  )
}
