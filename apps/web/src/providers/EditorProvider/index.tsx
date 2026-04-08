import { EditorContext, type TerminalEntry } from '@/context/EditorContext'
import { usePyodide, type PythonFile } from '@/hooks/usePyodide'
import type { editor } from 'monaco-editor'
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface EditorProviderProps {
  children: ReactNode
  initialFiles: PythonFile[]
}

export function EditorProvider({
  children,
  initialFiles,
}: EditorProviderProps) {
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([])
  const [files, setFiles] = useState<PythonFile[]>(initialFiles)
  const [activeFile, setActiveFile] = useState<string>('main.py')
  const [pendingInput, setPendingInput] = useState<string | null>(null)

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const {
    runCode,
    sendInput,
    status,
    stopExecution: stopExecutionPyodide,
  } = usePyodide({
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

  function getUpdatedFiles() {
    if (!editorRef.current) return null
    const currentEditorContent = editorRef.current.getValue()
    const updatedFiles = files.map((f) => {
      if (f.name === activeFile) {
        return { ...f, content: currentEditorContent }
      }
      return f
    })

    return updatedFiles
  }

  function codeExecution() {
    const updatedFiles = getUpdatedFiles()
    if (!updatedFiles) return

    setFiles(updatedFiles)
    setPendingInput(null)
    setTerminalEntries([])

    runCode(updatedFiles, activeFile)
  }

  function stopExecution() {
    stopExecutionPyodide()
    setPendingInput(null)
  }

  function submitInput(input: string) {
    setTerminalEntries((prev) => [
      ...prev,
      { kind: 'input', text: `${pendingInput}${input}` },
    ])

    setPendingInput(null)
    sendInput(input)
  }

  function newFile(fileName: string) {
    const fileNameWithExtensionPython = `${fileName}.py`
    const fileWithSameName = files.some(
      (f) => f.name === fileNameWithExtensionPython,
    )
    if (fileWithSameName) {
      throw new Error('There is already a file with that name')
    }

    const filesListWithNewFile = [
      ...files,
      { name: fileNameWithExtensionPython, content: '' },
    ]
    setFiles(filesListWithNewFile)
    setActiveFile(fileNameWithExtensionPython)
  }

  function removeFile(fileName: string) {
    const filesWithoutFileRemoved = files.filter(
      (file) => file.name !== fileName,
    )

    setFiles(filesWithoutFileRemoved)

    if (activeFile === fileName) {
      setActiveFile('main.py')
    }
  }

  function switchActiveFile(fileName: string) {
    const updatedFiles = getUpdatedFiles()
    if (!updatedFiles) return

    setFiles(updatedFiles)
    setActiveFile(fileName)
  }

  useEffect(() => {
    if (!editorRef.current) return

    const currentActiveFile = files.find((file) => file.name === activeFile)

    editorRef.current.setValue(currentActiveFile?.content ?? '')
  }, [activeFile, editorRef])

  return (
    <EditorContext.Provider
      value={{
        terminalEntries,
        files,
        activeFile,
        pendingInput,
        editorRef,
        status,
        getUpdatedFiles,
        codeExecution,
        stopExecution,
        submitInput,
        newFile,
        removeFile,
        switchActiveFile,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}
