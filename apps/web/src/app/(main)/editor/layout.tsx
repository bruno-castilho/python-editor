import { readFileSync } from 'fs'
import { join } from 'path'
import { Box } from '@mui/material'
import { Markdown } from '@/components/Markdown'

export default function Layout({ children }: { children: React.ReactNode }) {
  const content = readFileSync(
    join(process.cwd(), 'src/assets/quick-start-editor.md'),
    'utf-8',
  )

  return (
    <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {children}
      <Markdown>{content}</Markdown>
    </Box>
  )
}
