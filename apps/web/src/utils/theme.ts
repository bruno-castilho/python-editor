import { createTheme } from '@mui/material/styles'
import { grey } from '@mui/material/colors'

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

export const scrollbarThumbLight = '#d4e2ee'

export const scrollbarThumbDark = '#24425d'

const textDark = '#E6EDF3'
const textLight = '#1F2328'

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data',
  },

  colorSchemes: {
    light: {
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
          disabledBackground: grey[300],
          focus: `rgba(55, 118, 171, 0.2)`,
        },
      },
    },

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
          disabledBackground: grey[700],
          focus: `rgba(255, 212, 59, 0.2)`,
        },
      },
    },
  },

  typography: {
    fontFamily: '"Fira Code", monospace',
    // Títulos: escalam entre 600px e 1200px
    h1: {
      fontSize: 'clamp(2.25rem, 4.13vw + 0.7rem, 3.8rem)',
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontSize: 'clamp(1.75rem, 3.33vw + 0.5rem, 3rem)',
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: 'clamp(1.5rem, 2.4vw + 0.6rem, 2.4rem)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: { fontSize: 'clamp(1.25rem, 2.33vw + 0.375rem, 2.125rem)' },
    h5: { fontSize: 'clamp(1.0625rem, 1.17vw + 0.625rem, 1.5rem)' },
    h6: { fontSize: 'clamp(1rem, 0.67vw + 0.75rem, 1.25rem)' },

    body1: {
      fontSize: 'clamp(0.875rem, 0.21vw + 0.795rem, 1rem)',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: 'clamp(0.8125rem, 0.15vw + 0.756rem, 0.9rem)',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: 'clamp(0.6875rem, 0.11vw + 0.647rem, 0.75rem)',
      lineHeight: 1.7,
    },
    caption: { fontSize: 'clamp(0.625rem, 0.21vw + 0.545rem, 0.75rem)' },
    button: {
      textTransform: 'uppercase',
      fontWeight: 700,
      fontSize: 'clamp(0.8125rem, 0.11vw + 0.772rem, 0.875rem)',
    },
  },

  components: {
    MuiButton: {
      variants: [
        {
          props: { size: 'small' },
          style: { fontSize: 'clamp(0.7rem, 0.19vw + 0.628rem, 0.8125rem)' },
        },
        {
          props: { size: 'large' },
          style: { fontSize: 'clamp(0.875rem, 0.11vw + 0.835rem, 0.9375rem)' },
        },
      ],
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: 'clamp(0.8125rem, 0.11vw + 0.772rem, 0.875rem)' },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: { fontSize: 'clamp(0.8125rem, 0.11vw + 0.772rem, 0.875rem)' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: 'clamp(0.75rem, 0.21vw + 0.670rem, 0.875rem)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontSize: 'clamp(0.75rem, 0.11vw + 0.710rem, 0.8125rem)' },
        sizeSmall: { fontSize: 'clamp(0.6875rem, 0.11vw + 0.647rem, 0.75rem)' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: 'clamp(0.5625rem, 0.21vw + 0.482rem, 0.6875rem)' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { fontSize: 'clamp(0.8125rem, 0.11vw + 0.772rem, 0.875rem)' },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { fontSize: 'clamp(0.875rem, 0.21vw + 0.795rem, 1rem)' },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        fontSizeSmall: { fontSize: 'clamp(1rem, 0.43vw + 0.84rem, 1.25rem)' },
        fontSizeMedium: {
          fontSize: 'clamp(1.25rem, 0.43vw + 1.09rem, 1.5rem)',
        },
        fontSizeLarge: {
          fontSize: 'clamp(1.75rem, 0.75vw + 1.469rem, 2.1875rem)',
        },
      },
    },
  },
})
