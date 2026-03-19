'use client'
import type { PythonFile } from '@/hooks/usePyodide'
import { Close } from '@mui/icons-material'
import { Box, IconButton, Tab, Tabs } from '@mui/material'

interface FileTabBarProps {
  files: PythonFile[]
  activeFile: string
  onSwitchFile: (id: string) => void
  onDeleteFile: (id: string) => void
}

export function FileTabBar({
  files,
  activeFile,
  onSwitchFile,
  onDeleteFile,
}: FileTabBarProps) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}
    >
      <Tabs
        value={activeFile}
        onChange={(_, id: string) => onSwitchFile(id)}
        textColor="secondary"
        indicatorColor="secondary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 36,
          '& .MuiTabs-root': { minHeight: 36 },
          '& .MuiTab-root': {
            minHeight: 36,
            py: 0.5,
            px: 1.5,
            textTransform: 'none',
          },
        }}
      >
        {files.map((file) => (
          <Tab
            key={file.name}
            value={file.name}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box component="span">{file.name}</Box>
                {file.name !== 'main.py' && (
                  <IconButton
                    size="small"
                    component="span"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteFile(file.name)
                    }}
                    sx={{
                      p: 0.25,
                      ml: 0.25,
                      opacity: 0.6,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  )
}
