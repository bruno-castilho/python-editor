import {
  Add,
  MoreVert,
  PlayArrow,
  Save,
  SmartToy,
  Stop,
} from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import { useState } from 'react'
import { ChatAgentDialog } from '../ChatAgentDialog'
import { NewFileDialog } from '../NewFileDialog'
import { SaveProjectDialog } from '../SaveProjectDialog'
import { useEditor } from '@/hooks/useEditor'

export function EditorMenu() {
  const [openNewFileDialog, setOpenNewFileDialog] = useState<boolean>(false)
  const [openChatDialog, setOpenChatDialog] = useState<boolean>(false)
  const [openSaveProjectDialog, setOpenSaveProjectDialog] =
    useState<boolean>(false)

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const { status, codeExecution, stopExecution } = useEditor()

  function handleCodeExecution() {
    codeExecution()
  }

  function handleStopExecution() {
    stopExecution()
  }

  function handleOpenSaveProjectDialog(): void {
    setOpenSaveProjectDialog(true)
  }

  function handleCloseSaveProjectDialog(): void {
    setOpenSaveProjectDialog(false)
  }

  function handleChatDialog() {
    setOpenChatDialog((open) => !open)
  }

  function handleOptionMenuOpen(e: React.MouseEvent<HTMLElement>) {
    setMenuAnchor(e.currentTarget)
  }

  function handleOptionMenuClose() {
    setMenuAnchor(null)
  }

  function handleOpenNewFileDialog() {
    setOpenNewFileDialog(!openNewFileDialog)
  }

  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0 }}>
        <Button
          onClick={handleChatDialog}
          startIcon={<SmartToy />}
          color="primary"
        >
          Chat AI
        </Button>
        <Button
          onClick={handleOpenNewFileDialog}
          startIcon={<Add />}
          color="primary"
        >
          New File
        </Button>
        <Button
          onClick={handleOpenSaveProjectDialog}
          startIcon={<Save />}
          color="primary"
        >
          Save
        </Button>

        {status === 'idle' ? (
          <Button
            onClick={handleCodeExecution}
            startIcon={<PlayArrow />}
            color="primary"
          >
            Run
          </Button>
        ) : (
          <Button
            onClick={handleStopExecution}
            startIcon={<Stop />}
            color="primary"
            loading={status === 'stopping'}
          >
            Stop
          </Button>
        )}
      </Box>
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}>
        <IconButton onClick={handleOptionMenuOpen} color="primary">
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleOptionMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleOptionMenuClose()
              handleChatDialog()
            }}
          >
            <SmartToy sx={{ mr: 1 }} fontSize="small" /> Chat AI
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleOptionMenuClose()
              handleOpenNewFileDialog()
            }}
          >
            <Add sx={{ mr: 1 }} fontSize="small" /> New File
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleOptionMenuClose()
              handleOpenSaveProjectDialog()
            }}
          >
            <Save sx={{ mr: 1 }} fontSize="small" /> Save
          </MenuItem>
          {status === 'idle' ? (
            <MenuItem
              onClick={() => {
                handleOptionMenuClose()
                handleCodeExecution()
              }}
            >
              <PlayArrow sx={{ mr: 1 }} fontSize="small" /> Run
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                handleOptionMenuClose()
                handleStopExecution()
              }}
            >
              {status === 'stopping' ? (
                <CircularProgress size={16} sx={{ mr: 1 }} />
              ) : (
                <Stop sx={{ mr: 1 }} fontSize="small" />
              )}
              Stop
            </MenuItem>
          )}
        </Menu>
      </Box>
      <NewFileDialog
        open={openNewFileDialog}
        onClose={handleOpenNewFileDialog}
      />
      <ChatAgentDialog open={openChatDialog} onClose={handleChatDialog} />
      <SaveProjectDialog
        open={openSaveProjectDialog}
        onClose={handleCloseSaveProjectDialog}
      />
    </>
  )
}
