import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useTheme } from '@mui/material/styles'
import {
  codeTagProps,
  getCustomStyle,
  getLineNumberStyle,
  pythonDarkTheme,
  pythonLightTheme,
} from './syntax-theme'
import type { ExtraProps } from 'react-markdown'
import { Box, IconButton } from '@mui/material'
import type { ComponentPropsWithoutRef } from 'react'

const dark = {
  bg: '#1B2A3B',
  headerBg: '#152232',
  border: '#2A3F55',
  inlineBorder: '#2A3F55',
  accent: '#3776AB',
  accentHover: '#FFD43B',
  fg: '#E8E8E8',
}

const light = {
  bg: '#F5F8FC',
  headerBg: '#EBF2FA',
  border: '#D5E3F0',
  inlineBorder: '#D5E3F0',
  accent: '#3776AB',
  accentHover: '#B07D00',
  fg: '#212121',
}

type CodeProps = ComponentPropsWithoutRef<'code'> & ExtraProps

export function Code({ className, children, ...props }: CodeProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const customStyle = isDark ? dark : light
  const syntaxTheme = isDark ? pythonDarkTheme : pythonLightTheme

  const match = /language-(\w+)/.exec(className || '')
  const language = match?.[1] || 'text'
  const isInline = !match
  const code = String(children).replace(/\n$/, '')

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  if (isInline) {
    return (
      <Box
        component="code"
        sx={{
          fontFamily: '"Cascadia Code", "Fira Code", Consolas, monospace',
          fontSize: '0.85em',
          bgcolor: customStyle.bg,
          color: customStyle.fg,
          px: 0.6,
          py: 0.2,
          borderRadius: '4px',
          border: `1px solid ${customStyle.inlineBorder}`,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '6px',
        overflow: 'hidden',
        border: `1px solid ${customStyle.border}`,
        my: 1,
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: customStyle.headerBg,
          px: 1.5,
          py: 0.5,
          borderBottom: `1px solid ${customStyle.border}`,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '0.72rem',
            fontFamily: '"Cascadia Code", "Fira Code", Consolas, monospace',
            color: customStyle.accent,
            textTransform: 'lowercase',
          }}
        >
          {language}
        </Box>

        <IconButton
          size="small"
          onClick={handleCopy}
          title="Copy code"
          sx={{
            color: customStyle.accent,
            p: 0.5,
            '&:hover': { color: customStyle.accentHover },
          }}
        >
          <ContentCopyIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      <SyntaxHighlighter
        language={language}
        style={syntaxTheme}
        showLineNumbers
        customStyle={getCustomStyle(customStyle.bg)}
        lineNumberStyle={getLineNumberStyle(customStyle.accent)}
        codeTagProps={codeTagProps}
      >
        {code}
      </SyntaxHighlighter>
    </Box>
  )
}
