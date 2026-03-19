import { Header } from '@/components/Header'
import { Box } from '@mui/material'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
