'use client'
import { Box, Card, CardContent, Divider } from '@mui/material'
import { FileTabBar } from './FileTabBar'
import { Terminal } from './Terminal'
import { VSEditor } from './VSEditor'
import { EditorProvider } from '@/providers/EditorProvider'
import { EditorMenu } from './EditorMenu'
import type { PythonFile } from '@/hooks/usePyodide'

export type InitialFiles = [
  {
    name: 'main.py'
    content: string
  },
  ...PythonFile[],
]

interface EditorProps {
  initialFiles: InitialFiles
  project?: {
    id: string
    name: string
  }
}

export function Editor({ initialFiles, project }: EditorProps) {
  return (
    <EditorProvider initialFiles={initialFiles}>
      <Box component={Card} variant="outlined" width="100%">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1,
            py: 0.5,
            gap: 1,
          }}
        >
          <FileTabBar />

          <EditorMenu project={project} />
        </Box>
        <Divider />
        <CardContent>
          <VSEditor defaultValue={initialFiles[0].content} />
        </CardContent>
        <Divider />
        <CardContent sx={{ height: '30vh' }}>
          <Terminal />
        </CardContent>
      </Box>
    </EditorProvider>
  )
}
