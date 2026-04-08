import { Markdown } from '@/components/Markdown'
import { useOpenRouter } from '@/hooks/useOpenRouter'
import { Send } from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const {
    messages,
    sendMessage,
    isPendingModels,
    models,
    isStreaming,
    streamError,
  } = useOpenRouter({
    apiKey,
  })

  function handleModelChange(event: SelectChangeEvent) {
    setSelectedModel(event.target.value)
  }

  function handleSend() {
    const content = inputValue.trim()
    if (!content) return
    setInputValue('')

    sendMessage(content, selectedModel)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>Model</InputLabel>

          <Select
            value={selectedModel}
            label="Model"
            onChange={handleModelChange}
            disabled={isPendingModels}
          >
            {isPendingModels ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading models...
              </MenuItem>
            ) : (
              models?.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1.5,
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
        {messages.map((msg, index) => (
          <Fragment key={index}>
            {msg.role === 'assistant' && (
              <Box
                sx={{
                  alignSelf: 'flex-start',
                  px: 1.5,
                  py: 1,
                }}
              >
                <Markdown>{msg.content}</Markdown>
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

            {msg.role === 'user' && (
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
                  {msg.content}
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
      <Box>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder="Type a message... (Enter to send)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming || !selectedModel}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={
                      isStreaming || !inputValue.trim() || !selectedModel
                    }
                    edge="end"
                  >
                    {isStreaming ? <CircularProgress size={20} /> : <Send />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </>
  )
}
