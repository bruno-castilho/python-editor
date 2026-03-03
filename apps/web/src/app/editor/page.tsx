'use client'
import { Add, MoreVert, PlayArrow, Save, Stop } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import { VSEditor } from './components/VSEditor'
import { Terminal, type TerminalEntry } from './components/Terminal'
import { FileTabBar } from './components/FileTabBar'
import { editor } from 'monaco-editor'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { usePyodide, type PythonFile } from '../../hooks/usePyodide'
import { NewFileDialog } from '@/components/NewFileDialog'
import { AlertContext } from '@/context/AlertContext'

const MAIN_DEFAULT_CONTENT = `# Python Editor\ndef greet(name: str) -> str:\n    """Return a greeting message."""\n    return f"Hello, {name}!"\n\nname = input("Enter your name: ")\n\nprint(greet(name))`

const INITIAL_FILES: PythonFile[] = [
  { name: 'main.py', content: MAIN_DEFAULT_CONTENT },
]

export default function Page() {
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([])
  const [openNewFileDialog, setOpenNewFileDialog] = useState<boolean>(false)
  const [files, setFiles] = useState<PythonFile[]>(INITIAL_FILES)
  const [activeFile, setActiveFile] = useState<string>('main.py')
  const [pendingInput, setPendingInput] = useState<string | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const alert = useContext(AlertContext)

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const { runCode, sendInput, status, stopExecution } = usePyodide({
    stdinCallback: (text) => {
      setPendingInput(text)
    },
    stdoutCallback: (text) => {
      setTerminalEntries((prev) => [...prev, { kind: 'output', text }])
    },
    stderrCallback: (text) => {
      setTerminalEntries((prev) => [...prev, { kind: 'error', text }])
    },
  })

  function handleOptionMenuOpen(e: React.MouseEvent<HTMLElement>) {
    setMenuAnchor(e.currentTarget)
  }

  function handleOptionMenuClose() {
    setMenuAnchor(null)
  }

  function handleOpenNewFileDialog() {
    setOpenNewFileDialog(!openNewFileDialog)
  }

  function handleNewFile(fileName: string) {
    const fileNameWithExtensionPython = `${fileName}.py`

    const fileWithSameName = files.some(
      (f) => f.name === fileNameWithExtensionPython,
    )

    if (fileWithSameName) {
      alert.error('There is already a file with that name')
      return
    }

    const filesListWithNewFile = [
      ...files,
      { name: fileNameWithExtensionPython, content: '' },
    ]

    setFiles(filesListWithNewFile)
    setActiveFile(fileNameWithExtensionPython)
  }

  function handleDeleteFile(name: string) {
    const filesWithoutFileRemoved = files.filter((f) => f.name !== name)

    setFiles(filesWithoutFileRemoved)

    if (activeFile === name) {
      setActiveFile('main.py')
    }
  }

  function handleSwitchFile(newActiveFileName: string) {
    if (!editorRef.current) return

    const currentEditorContent = editorRef.current.getValue()

    const updatedFiles = files.map((f) => {
      if (f.name === activeFile) {
        return { ...f, content: currentEditorContent }
      }
      return f
    })

    setFiles(updatedFiles)
    setActiveFile(newActiveFileName)
  }

  function handleSave() {
    console.log('handleSaveCode')
  }

  function handleCodeExecution() {
    if (!editorRef.current) return

    const currentEditorContent = editorRef.current.getValue()

    const updatedFiles = files.map((f) => {
      if (f.name === activeFile) {
        return { ...f, content: currentEditorContent }
      }
      return f
    })

    setFiles(updatedFiles)
    setTerminalEntries([])
    setPendingInput(null)

    runCode(updatedFiles, activeFile)
  }

  function handleSubmitInput(text: string) {
    setTerminalEntries((prev) => [
      ...prev,
      { kind: 'input', text: `${pendingInput}${text}` },
    ])

    setPendingInput(null)
    sendInput(text)
  }

  function handleStopExecution() {
    stopExecution()
    setPendingInput(null)
  }

  useEffect(() => {
    if (!editorRef.current) return

    const currentActiveFile = files.find((f) => f.name === activeFile)

    editorRef.current.setValue(currentActiveFile?.content ?? '')
  }, [activeFile, editorRef])

  return (
    <>
      <DefaultLayout>
        <Box component={Card} variant="outlined" maxWidth="1488px" width="100%">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1,
              py: 0.5,
              gap: 1,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FileTabBar
                files={files}
                activeFile={activeFile}
                onSwitchFile={handleSwitchFile}
                onDeleteFile={handleDeleteFile}
              />
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0 }}>
              <Button
                onClick={handleOpenNewFileDialog}
                startIcon={<Add />}
                color="primary"
              >
                New File
              </Button>
              <Button onClick={handleSave} startIcon={<Save />} color="primary">
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
                    handleOpenNewFileDialog()
                  }}
                >
                  <Add sx={{ mr: 1 }} fontSize="small" /> New File
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleOptionMenuClose()
                    handleSave()
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
          </Box>
          <Divider />
          <CardContent>
            <VSEditor ref={editorRef} defaultValue={MAIN_DEFAULT_CONTENT} />
          </CardContent>
          <Divider />
          <CardContent sx={{ height: '30vh' }}>
            <Terminal
              entries={terminalEntries}
              onSubmitInput={handleSubmitInput}
              pendingInput={pendingInput}
            />
          </CardContent>
        </Box>
      </DefaultLayout>
      <NewFileDialog
        open={openNewFileDialog}
        onClose={handleOpenNewFileDialog}
        handleNewFile={handleNewFile}
      />
    </>
  )
}
