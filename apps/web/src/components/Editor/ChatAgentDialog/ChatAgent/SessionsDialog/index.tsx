import type { ChatSession } from '@/lib/chat-sessions'
import {
  CheckOutlined,
  Close,
  DeleteOutlined,
  EditOutlined,
} from '@mui/icons-material'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import { formatDistanceToNowStrict } from 'date-fns'
import { useState, type KeyboardEvent } from 'react'

interface SessionsDialogProps {
  open: boolean
  onClose: () => void
  sessions: ChatSession[]
  activeSessionId: string | null
  onLoad: (session: ChatSession) => void
  onRename: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SessionsDialog({
  open,
  onClose,
  sessions,
  activeSessionId,
  onLoad,
  onRename,
  onDelete,
}: SessionsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const filteredSessions = sessions.filter((session) =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  function handleStartEditing(session: ChatSession) {
    setEditingId(session.id)
    setEditingName(session.name)
  }

  async function handleSaveRename(id: string) {
    const trimmedName = editingName.trim()
    if (trimmedName) {
      await onRename(id, trimmedName)
    }
    setEditingId(null)
    setEditingName('')
  }

  function handleRenameKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    id: string,
  ) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSaveRename(id)
    }
    if (event.key === 'Escape') {
      setEditingId(null)
      setEditingName('')
    }
  }

  function handleClose() {
    setSearchQuery('')
    setEditingId(null)
    setEditingName('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="body1" fontWeight="medium" component="span">
          Sessions
        </Typography>
        <IconButton size="small" onClick={handleClose} edge="end">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, px: 2, pb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search sessions…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          sx={{ mb: 1.5 }}
          slotProps={{
            input: {
              sx: { fontSize: '0.875rem' },
            },
          }}
        />

        {filteredSessions.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ py: 3 }}
          >
            {sessions.length === 0
              ? 'No sessions yet. Start a conversation to create one.'
              : 'No sessions match your search.'}
          </Typography>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {filteredSessions.map((session, index) => (
              <Box key={session.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    editingId !== session.id ? (
                      <Box display="flex" gap={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => handleStartEditing(session)}
                          aria-label="Edit session name"
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(session.id)}
                          aria-label="Delete session"
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleSaveRename(session.id)}
                        aria-label="Save session name"
                      >
                        <CheckOutlined fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  {editingId === session.id ? (
                    <TextField
                      fullWidth
                      size="small"
                      autoFocus
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onBlur={() => handleSaveRename(session.id)}
                      onKeyDown={(event) =>
                        handleRenameKeyDown(
                          event as KeyboardEvent<HTMLInputElement>,
                          session.id,
                        )
                      }
                      sx={{ pr: 5 }}
                      slotProps={{
                        input: { sx: { fontSize: '0.875rem' } },
                      }}
                    />
                  ) : (
                    <ListItemButton
                      onClick={() => onLoad(session)}
                      selected={session.id === activeSessionId}
                      sx={{
                        borderRadius: 1,
                        pr: 11,
                        '&:hover': { bgcolor: 'action.hover' },
                        '&.Mui-selected': { bgcolor: 'action.selected' },
                        '&.Mui-selected:hover': { bgcolor: 'action.selected' },
                      }}
                    >
                      <ListItemText
                        primary={session.name}
                        secondary={formatDistanceToNowStrict(session.updatedAt)}
                        slotProps={{
                          primary: {
                            variant: 'body2',
                            noWrap: true,
                          },
                          secondary: {
                            variant: 'caption',
                          },
                        }}
                      />
                    </ListItemButton>
                  )}
                </ListItem>
                {index < filteredSessions.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}
