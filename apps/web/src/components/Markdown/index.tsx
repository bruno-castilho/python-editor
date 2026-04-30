'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Code } from './Code'
import { Box, Divider, Link } from '@mui/material'
import type { ComponentPropsWithoutRef } from 'react'

interface MarkdownProps {
  children: string
}

function MarkdownLink({ href, children }: ComponentPropsWithoutRef<'a'>) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={(theme) => ({
        color: theme.palette.primary.main,
        textDecoration: 'none',
        ...theme.applyStyles('dark', {
          color: theme.palette.secondary.main,
        }),
      })}
    >
      {children}
    </Link>
  )
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: Code,
          hr: () => <Divider sx={{ my: 3 }} />,
          a: MarkdownLink,
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  )
}
