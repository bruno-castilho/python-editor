import { Markdown } from '@/components/Markdown'
import { useChatSessions } from '@/hooks/useChatSessions'
import { useOpenRouter } from '@/hooks/useOpenRouter'
import type { ChatSession } from '@/lib/chat-sessions'
import { SessionsDialog } from './SessionsDialog'
import { Add, Send } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'

interface ChatAgentProps {
  apiKey: string
}

export function ChatAgent({ apiKey }: ChatAgentProps) {
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const {
    messages,
    sendMessage,
    resetMessages,
    isPendingModels,
    models,
    isStreaming,
    streamError,
  } = useOpenRouter({ apiKey })

  const {
    sessions,
    activeSessionId,
    persistFirstExchange,
    updateCurrentSession,
    loadSession,
    startNewSession,
    renameSession,
    deleteSession,
  } = useChatSessions()

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  )
  const sessionTitle = activeSession?.name ?? 'New Session'

  function handleModelChange(event: SelectChangeEvent) {
    setSelectedModel(event.target.value)
  }

  async function handleSend() {
    const content = inputValue.trim()
    if (!content) return
    setInputValue('')

    const result = await sendMessage(content, selectedModel)
    if (!result.success) return

    if (activeSessionId === null) {
      await persistFirstExchange(result.messages, selectedModel)
    } else {
      await updateCurrentSession(result.messages, selectedModel)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  function handleNewSession() {
    startNewSession()
    resetMessages()
    setSelectedModel('')
  }

  function handleLoadSession(session: ChatSession) {
    const { messages: loadedMessages, model } = loadSession(session)
    resetMessages(loadedMessages)
    setSelectedModel(model)
    setSessionsOpen(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Box>
          <Typography variant="body2" component="h2">
            {sessionTitle}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSessionsOpen(true)}
          >
            Sessions
          </Button>
          <Button variant="outlined" size="small" onClick={handleNewSession}>
            New Session
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ m: 'auto' }}
          >
            Send a message to start the conversation.
          </Typography>
        )}
        {messages.map((message, index) => (
          <Fragment key={index}>
            {message.role === 'assistant' && (
              <Box
                sx={{
                  alignSelf: 'flex-start',
                  px: 1.5,
                  py: 1,
                }}
              >
                <Markdown>{message.content}</Markdown>
                {index === messages.length - 1 && isStreaming && (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'currentColor',
                      ml: 0.5,
                      animation: 'blink 1s step-start infinite',
                      '@keyframes blink': {
                        '50%': { opacity: 0 },
                      },
                    }}
                  />
                )}
              </Box>
            )}

            {message.role === 'user' && (
              <Box
                sx={{
                  alignSelf: 'flex-end',
                  maxWidth: '80%',
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
              </Box>
            )}
          </Fragment>
        ))}

        {streamError && (
          <Box
            sx={{
              alignSelf: 'flex-start',
              maxWidth: '80%',
              px: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor: 'error.main',
              color: 'text.primary',
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {streamError}
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 1, py: 0.5 }}>
          <IconButton size="small" disabled>
            <Add fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        <Box
          component="textarea"
          value={inputValue}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setInputValue(event.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={isStreaming || !selectedModel || isPendingModels}
          placeholder="Type a message... (Enter to send)"
          rows={4}
          sx={{
            width: '100%',
            resize: 'none',
            border: 'none',
            outline: 'none',
            bgcolor: 'transparent',
            color: 'text.primary',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            px: 1.5,
            py: 1,
            boxSizing: 'border-box',
            '&::placeholder': { color: 'text.secondary' },
            '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.5,
          }}
        >
          <Select
            value={selectedModel}
            onChange={handleModelChange}
            disabled={isPendingModels || isStreaming}
            variant="standard"
            disableUnderline
            displayEmpty
            size="small"
            sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
          >
            <MenuItem disabled value="">
              Select a model
            </MenuItem>
            {isPendingModels ? (
              <MenuItem disabled value="">
                <CircularProgress size={12} sx={{ mr: 1 }} />
                Loading...
              </MenuItem>
            ) : (
              models?.map((model) => (
                <MenuItem
                  key={model.id}
                  value={model.id}
                  sx={{ fontSize: '0.75rem' }}
                >
                  {model.name}
                </MenuItem>
              ))
            )}
          </Select>

          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              handleSend()
            }}
            disabled={isStreaming || !inputValue.trim() || !selectedModel}
          >
            {isStreaming ? (
              <CircularProgress size={20} />
            ) : (
              <Send fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>

      <SessionsDialog
        open={sessionsOpen}
        onClose={() => setSessionsOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onLoad={handleLoadSession}
        onRename={renameSession}
        onDelete={deleteSession}
      />
    </>
  )
}
