import { createTheme } from '@mui/material/styles'

// --- Paleta de Cores Base "Radioactive Nebula" (Ainda mais Vivas) ---
const radioactiveRed = '#FF073A' // Vermelho Neon Intenso
const radioactiveBlue = '#00F0FF' // Ciano Elétrico Neon

const infoColor = '#00BFFF' // Azul para Info (Azul Cherenkov)
const successColor = '#39FF14' // Verde para Sucesso (Verde Neon Puro)
const warningColor = '#FFFF00' // Amarelo para Aviso (Amarelo Neon)
const errorColor = '#FF0000' // Vermelho para Erro (Vermelho Puro)

// Cores de fundo e texto
const darkBackground = '#121212' // Cinza muito escuro para o fundo principal (Dark Mode)
const darkPaper = '#1E1E1E' // Cinza escuro para superfícies (Dark Mode)

const lightBackground = '#F0F8FF' // Azul claro para o fundo principal (Light Mode)
const lightPaper = '#FFFFFF' // Branco puro para superfícies (Light Mode)

const textDark = '#E0E0E0' // Branco suave para texto em fundos escuros
const textLight = '#212121' // Cinza muito escuro para texto em fundos claros

export const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: radioactiveRed,
      light: '#FF8C00',
      dark: '#C4052B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: radioactiveBlue,
      light: '#00FFFF',
      dark: '#00B3CC',
      contrastText: '#121212',
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
      secondary: '#616161',
      disabled: '#B0B0B0',
    },
    action: {
      active: radioactiveBlue,
      selected: `rgba(0, 240, 255, 0.2)`, // Um pouco de opacidade para seleção
      disabled: 'rgba(0, 0, 0, 0.35)', // Mais escuro para desabilitado
      disabledBackground: 'rgba(0, 0, 0, 0.15)',
      focus: `rgba(0, 240, 255, 0.25)`,
    },
  },
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: radioactiveRed,
          light: '#FF8C00',
          dark: '#C4052B',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: radioactiveBlue,
          light: '#00FFFF',
          dark: '#00B3CC',
          contrastText: '#121212',
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
          secondary: '#B0B0B0',
          disabled: '#4A4A4A',
        },
        action: {
          active: radioactiveBlue,
          selected: `rgba(0, 240, 255, 0.2)`, // Um pouco de opacidade para seleção
          disabled: 'rgba(0, 0, 0, 0.35)', // Mais escuro para desabilitado
          disabledBackground: 'rgba(0, 0, 0, 0.15)',
          focus: `rgba(0, 240, 255, 0.25)`,
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
