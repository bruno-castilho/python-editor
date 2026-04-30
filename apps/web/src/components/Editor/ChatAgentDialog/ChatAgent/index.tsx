import { Markdown } from '@/components/Markdown'
import { useEditor } from '@/hooks/useEditor'
import { useChatSessions } from '@/hooks/useChatSessions'
import { useOpenRouter } from '@/hooks/useOpenRouter'
import type { PythonFile } from '@/hooks/usePyodide'
import type { ChatSession } from '@/lib/chat-sessions'
import logoPythonSvg from '@/assets/logo-python.svg'
import { SessionsDialog } from './SessionsDialog'
import {
  AccessTime,
  Add,
  Close,
  MapsUgcSharp,
  RefreshOutlined,
  Send,
  Stop,
} from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Tooltip,
  MenuItem as SelectMenuItem,
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
  open: boolean
}

export function ChatAgent({ apiKey, open }: ChatAgentProps) {
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const [selectedContextFiles, setSelectedContextFiles] = useState<
    PythonFile[]
  >([])
  const [files, setFiles] = useState<PythonFile[]>([])
  const [fileMenuAnchorEl, setFileMenuAnchorEl] = useState<HTMLElement | null>(
    null,
  )
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const { activeFile, getUpdatedFiles } = useEditor()

  const {
    messages,
    sendMessage,
    stopStreaming,
    switchMessages,
    isPendingModels,
    models,
    isStreaming,
    streamError,
  } = useOpenRouter({ apiKey })

  const {
    sessions,
    activeSessionId,
    newSession,
    updateCurrentSession,
    switchActiveSession,
    renameSession,
    deleteSession,
  } = useChatSessions()

  function handleModelChange(event: SelectChangeEvent) {
    setSelectedModel(event.target.value)
  }

  function handleOpenFileMenu(event: React.MouseEvent<HTMLElement>) {
    setFileMenuAnchorEl(event.currentTarget)
  }

  function handleCloseFileMenu() {
    setFileMenuAnchorEl(null)
  }

  function handleAddContextFile(file: PythonFile) {
    setSelectedContextFiles((previous) => [...previous, file])
    handleCloseFileMenu()
  }

  function handleRemoveContextFile(fileName: string) {
    setSelectedContextFiles((previous) =>
      previous.filter((file) => file.name !== fileName),
    )
  }

  async function handleSend() {
    const content = inputValue.trim()
    if (!content) return

    const completionCallback =
      activeSessionId === null ? newSession : updateCurrentSession

    sendMessage(
      content,
      selectedModel,
      selectedContextFiles,
      completionCallback,
    )

    setInputValue('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  function handleNewSession() {
    switchActiveSession(null)
    switchMessages([])
    setSelectedModel('')
  }

  function handleLoadSession(session: ChatSession) {
    switchActiveSession(session.id)
    switchMessages(session.messages)
    setSelectedModel(session.model)
    setSessionsOpen(false)
  }

  function handleResendMessage() {
    if (messages.length === 0) return

    const message = messages[messages.length - 1]
    if (message.role !== 'user') return

    setInputValue(message.content)
  }

  useEffect(() => {
    if (!open) return
    const updatedFiles = getUpdatedFiles() || []
    setFiles(updatedFiles)

    const activeFileData = updatedFiles.find((file) => file.name === activeFile)
    if (activeFileData) {
      setSelectedContextFiles([activeFileData])
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  )
  const sessionTitle = activeSession?.name ?? 'Untitled'

  const unselectedFiles = files.filter(
    (file) =>
      !selectedContextFiles.some((selected) => selected.name === file.name),
  )

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 1,
          ml: 3,
          mr: 3,
        }}
      >
        <Box>
          <Typography variant="body1" component="h2">
            <strong>{sessionTitle}</strong>
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Session history">
            <IconButton size="small" onClick={() => setSessionsOpen(true)}>
              <AccessTime />
            </IconButton>
          </Tooltip>
          <Tooltip title="New session">
            <IconButton size="small" onClick={handleNewSession}>
              <MapsUgcSharp />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Divider />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pl: 3,
          pr: 3,
          '&:hover': {
            '::-webkit-scrollbar-thumb': {
              backgroundColor: 'action.hover',
            },
          },
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
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
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
                {index === messages.length - 1 && (
                  <Tooltip title="Resend message">
                    <IconButton size="small" onClick={handleResendMessage}>
                      <RefreshOutlined />
                    </IconButton>
                  </Tooltip>
                )}
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
          m: 3,
        }}
      >
        <Box
          sx={{
            px: 1,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          <Tooltip title="Add file context">
            <span>
              <IconButton
                size="small"
                onClick={handleOpenFileMenu}
                disabled={unselectedFiles.length === 0}
              >
                <Add fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          {selectedContextFiles.length > 0 && (
            <Tabs
              value={false}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                flex: 1,
                minWidth: 0,
                minHeight: 28,
                '& .MuiTabs-root': { minHeight: 28 },
                '& .MuiTab-root': {
                  minHeight: 28,
                  py: 0.25,
                  px: 1,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                },
              }}
            >
              {selectedContextFiles.map((file) => (
                <Tab
                  key={file.name}
                  value={file.name}
                  label={
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Box
                        component="img"
                        src={logoPythonSvg.src}
                        alt="Python"
                        sx={{ width: 12, height: 12 }}
                      />
                      <Box component="span">{file.name}</Box>
                      <IconButton
                        size="small"
                        component="span"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleRemoveContextFile(file.name)
                        }}
                        sx={{
                          p: 0.15,
                          ml: 0.25,
                          opacity: 0.6,
                          '&:hover': { opacity: 1 },
                        }}
                      >
                        <Close sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          )}

          <Menu
            anchorEl={fileMenuAnchorEl}
            open={Boolean(fileMenuAnchorEl)}
            onClose={handleCloseFileMenu}
            slotProps={{ paper: { sx: { maxHeight: 240, overflowY: 'auto' } } }}
          >
            {unselectedFiles.map((file) => (
              <MenuItem
                key={file.name}
                onClick={() => handleAddContextFile(file)}
              >
                <Box
                  component="img"
                  src={logoPythonSvg.src}
                  alt="Python"
                  sx={{ width: 16, height: 16, mr: 1 }}
                />
                {file.name}
              </MenuItem>
            ))}
          </Menu>
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
            sx={{ color: 'text.secondary' }}
          >
            <SelectMenuItem disabled value="">
              Select a model
            </SelectMenuItem>
            {isPendingModels ? (
              <SelectMenuItem disabled value="">
                <CircularProgress size={12} sx={{ mr: 1 }} />
                Loading...
              </SelectMenuItem>
            ) : (
              models?.map((model) => (
                <SelectMenuItem key={model.id} value={model.id}>
                  {model.name}
                </SelectMenuItem>
              ))
            )}
          </Select>

          {isStreaming ? (
            <IconButton size="small" onClick={stopStreaming}>
              <Stop fontSize="small" />
            </IconButton>
          ) : (
            <IconButton
              onClick={handleSend}
              disabled={!inputValue.trim() || !selectedModel}
            >
              <Send fontSize="small" />
            </IconButton>
          )}
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
