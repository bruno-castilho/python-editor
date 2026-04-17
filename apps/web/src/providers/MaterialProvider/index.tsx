'use client'
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material'
import {
  defaultTheme,
  scrollbarTrackLight,
  scrollbarThumbLight,
  scrollbarThumbLightHover,
  scrollbarTrackDark,
  scrollbarThumbDark,
  scrollbarThumbDarkHover,
} from '../../utils/theme'
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
            '*': {
              scrollbarWidth: 'thin',
              scrollbarColor:
                theme.palette.mode === 'dark'
                  ? `${scrollbarThumbDark} ${scrollbarTrackDark}`
                  : `${scrollbarThumbLight} ${scrollbarTrackLight}`,
            },
            '*::-webkit-scrollbar': { width: '6px', height: '6px' },
            '*::-webkit-scrollbar-track': {
              background:
                theme.palette.mode === 'dark'
                  ? scrollbarTrackDark
                  : scrollbarTrackLight,
            },
            '*::-webkit-scrollbar-thumb': {
              background:
                theme.palette.mode === 'dark'
                  ? scrollbarThumbDark
                  : scrollbarThumbLight,
              borderRadius: '3px',
            },
            '*::-webkit-scrollbar-thumb:hover': {
              background:
                theme.palette.mode === 'dark'
                  ? scrollbarThumbDarkHover
                  : scrollbarThumbLightHover,
            },
          })}
        />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
