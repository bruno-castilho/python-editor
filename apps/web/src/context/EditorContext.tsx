import { createContext, type RefObject } from 'react'
import type { editor } from 'monaco-editor'
import type { PyodideStatus, PythonFile } from '@/hooks/usePyodide'

export type TerminalEntry =
  | { kind: 'output'; text: string }
  | { kind: 'error'; text: string }
  | { kind: 'input'; text: string }

interface EditorContextType {
  terminalEntries: TerminalEntry[]
  files: PythonFile[]
  activeFile: string
  pendingInput: string | null

  editorRef: RefObject<editor.IStandaloneCodeEditor | null>

  status: PyodideStatus

  getUpdatedFiles: () => PythonFile[] | null

  codeExecution: () => void
  stopExecution: () => void
  submitInput: (input: string) => void

  newFile: (fileName: string) => void
  removeFile: (fileName: string) => void
  switchActiveFile: (fileName: string) => void
}

export const EditorContext = createContext({} as EditorContextType)
