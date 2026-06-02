import { Box } from '@mui/material'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {children}
    </Box>
  )
}
