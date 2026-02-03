'use client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { defaultTheme } from '../../utils/theme'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'

export default function MaterialProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
