'use client'
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material'
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
        <GlobalStyles
          styles={(theme) => ({
            '*::-webkit-scrollbar': {
              width: 14,
              height: 14,
            },

            '*::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
              boxShadow: `1px 0 0 0 ${theme.palette.divider} inset`,
            },

            '*::-webkit-scrollbar-thumb': {
              backgroundColor: 'transparent',
              borderRadius: 0,
              transition: 'background-color 0.8s ease-out',
            },
          })}
        />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
