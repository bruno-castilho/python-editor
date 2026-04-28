'use client'
import { useEditor } from '@/hooks/useEditor'
import { scrollbarThumbDark, scrollbarThumbLight } from '@/utils/theme'
import { Box, InputBase } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

export function Terminal() {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { terminalEntries, pendingInput, submitInput } = useEditor()

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      submitInput(inputValue)
      setInputValue('')
    }
  }

  useEffect(() => {
    if (pendingInput === null) {
      setInputValue('')
    }
  }, [pendingInput])

  return (
    <Box
      sx={(theme) => ({
        fontFamily: '"Fira Code", monospace',
        fontSize: 14,
        height: '100%',
        overflow: 'auto',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',

        '&:hover': {
          '::-webkit-scrollbar-thumb': {
            backgroundColor: scrollbarThumbLight,
          },
        },

        ...theme.applyStyles('dark', {
          '&:hover': {
            '::-webkit-scrollbar-thumb': {
              backgroundColor: scrollbarThumbDark,
            },
          },
        }),
      })}
      onClick={() => inputRef.current?.focus()}
    >
      {terminalEntries.map((terminalEntry, i) => {
        if (terminalEntry.kind === 'output') {
          return (
            <Box
              key={i}
              component="pre"
              sx={{
                m: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'text.primary',
              }}
            >
              {terminalEntry.text}
            </Box>
          )
        }
        if (terminalEntry.kind === 'error') {
          return (
            <Box
              key={i}
              component="pre"
              sx={{
                m: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'error.main',
              }}
            >
              {terminalEntry.text}
            </Box>
          )
        }
        return (
          <Box
            key={i}
            component="pre"
            sx={{
              m: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'text.secondary',
            }}
          >
            {terminalEntry.text}
          </Box>
        )
      })}

      {pendingInput && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="pre"
            sx={{
              m: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'text.primary',
            }}
          >
            {pendingInput}
          </Box>
          <InputBase
            inputRef={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            sx={{
              fontFamily: '"Fira Code", monospace',
              fontSize: 14,
              color: 'text.primary',
              flex: 1,
              '& input': { p: 0 },
            }}
          />
        </Box>
      )}
    </Box>
  )
}
