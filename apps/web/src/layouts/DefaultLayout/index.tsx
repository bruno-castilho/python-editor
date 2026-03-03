import { Header } from './Header'
import { Box } from '@mui/material'

interface DefaultLayoutProps {
  children: React.ReactNode
}

export function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <>
      <Header />
      <Box
        component="main"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        margin={2}
      >
        {children}
      </Box>
    </>
  )
}
