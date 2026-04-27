'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Code } from './Code'
import { Divider, Link, useTheme } from '@mui/material'
import type { ComponentPropsWithoutRef } from 'react'

interface MarkdownProps {
  children: string
}

function MarkdownLink({ href, children }: ComponentPropsWithoutRef<'a'>) {
  const theme = useTheme()
  const color =
    theme.palette.mode === 'dark'
      ? theme.palette.secondary.main
      : theme.palette.primary.main

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ color, textDecoration: 'none' }}
    >
      {children}
    </Link>
  )
}

export function Markdown({ children }: MarkdownProps) {
  return (
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
  )
}
