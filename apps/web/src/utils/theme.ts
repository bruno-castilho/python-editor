import { createTheme } from '@mui/material/styles'

// --- Paleta de Cores Python ---
const pythonBlue = '#3776AB'
const pythonYellow = '#FFD43B'

const infoColor = '#4DB8FF'
const successColor = '#4CAF50'
const warningColor = '#FF9800'
const errorColor = '#F44336'

// Cores de fundo e texto
const darkBackground = '#1B2A3B'
const darkPaper = '#161B22'

const lightBackground = '#F5F8FC'
const lightPaper = '#FFFFFF'

const textDark = '#E6EDF3'
const textLight = '#1F2328'

export const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: pythonBlue,
      light: '#5A9FCC',
      dark: '#265E8A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: pythonYellow,
      light: '#FFE476',
      dark: '#CCA800',
      contrastText: '#1F2328',
    },
    error: { main: errorColor },
    warning: { main: warningColor },
    info: { main: infoColor },
    success: { main: successColor },
    background: {
      default: lightBackground,
      paper: lightPaper,
    },
    text: {
      primary: textLight,
      secondary: '#57606A',
      disabled: '#B0B0B0',
    },
    action: {
      active: pythonBlue,
      selected: `rgba(55, 118, 171, 0.15)`,
      disabled: 'rgba(0, 0, 0, 0.35)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      focus: `rgba(55, 118, 171, 0.2)`,
    },
  },
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: pythonBlue,
          light: '#5A9FCC',
          dark: '#265E8A',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: pythonYellow,
          light: '#FFE476',
          dark: '#CCA800',
          contrastText: '#1F2328',
        },
        error: { main: errorColor },
        warning: { main: warningColor },
        info: { main: infoColor },
        success: { main: successColor },
        background: {
          default: darkBackground,
          paper: darkPaper,
        },
        text: {
          primary: textDark,
          secondary: '#8D96A0',
          disabled: '#4A4A4A',
        },
        action: {
          active: pythonYellow,
          selected: `rgba(255, 212, 59, 0.15)`,
          disabled: 'rgba(0, 0, 0, 0.35)',
          disabledBackground: 'rgba(0, 0, 0, 0.15)',
          focus: `rgba(255, 212, 59, 0.2)`,
        },
      },
    },
  },
  typography: {
    fontFamily: '"Fira Code", monospace',
    h1: { fontSize: '3.8rem', fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.025em' },
    h3: { fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.02em' },
    body1: { fontSize: '1rem', lineHeight: 1.7 },
    body2: { fontSize: '0.9rem', lineHeight: 1.6 },
    subtitle1: { fontSize: '0.75rem', lineHeight: 1.7 },
    button: {
      textTransform: 'uppercase',
      fontWeight: 700,
    },
  },
})
