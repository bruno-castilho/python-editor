'use client'
import { Box, InputBase } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

export type TerminalEntry =
  | { kind: 'output'; text: string }
  | { kind: 'error'; text: string }
  | { kind: 'input'; text: string }

interface TerminalProps {
  entries: TerminalEntry[]
  pendingInput: string | null
  onSubmitInput: (value: string) => void
}

export function Terminal({
  entries,
  pendingInput,
  onSubmitInput,
}: TerminalProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onSubmitInput(inputValue)
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
      sx={{
        fontFamily: '"Fira Code", monospace',
        fontSize: 14,
        height: '100%',
        overflow: 'auto',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        '&::-webkit-scrollbar': {
          width: 10,
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(121, 121, 121, 0.4)',
          borderRadius: 1,
          border: '2px solid transparent',
          backgroundClip: 'content-box',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(121, 121, 121, 0.7)',
          backgroundClip: 'content-box',
          border: '2px solid transparent',
        },
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {entries.map((entry, i) => {
        if (entry.kind === 'output') {
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
              {entry.text}
            </Box>
          )
        }
        if (entry.kind === 'error') {
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
              {entry.text}
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
            {entry.text}
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
