'use client'
import { useEditor } from '@/hooks/useEditor'
import { Close } from '@mui/icons-material'
import { Box, IconButton, Tab, Tabs } from '@mui/material'

export function FileTabBar() {
  const { files, activeFile, removeFile, switchActiveFile } = useEditor()

  function handleRemoveFile(fileName: string) {
    removeFile(fileName)
  }

  function handleSwitchFile(fileName: string) {
    switchActiveFile(fileName)
  }

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
        }}
      >
        <Tabs
          value={activeFile}
          onChange={(_, id: string) => handleSwitchFile(id)}
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
                        handleRemoveFile(file.name)
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
    </Box>
  )
}
