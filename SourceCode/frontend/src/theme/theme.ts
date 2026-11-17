import { createTheme } from '@mui/material/styles'

/** Design tokens of the "amber" direction: white page, amber accent, dark brown ink. */
export const tokens = {
  amber: '#EF8A1E',
  amberDark: '#C9690C',
  ink: '#1E1710',
  inkMuted: '#6E6153',
  link: '#B4561C',
  cream: '#FFFBF5',
  sand: '#F5EFE7',
  line: '#ECE4D9',
} as const

export const fonts = {
  display: '"Bricolage Grotesque", "Geist", system-ui, sans-serif',
  body: '"Geist", system-ui, -apple-system, "Segoe UI", sans-serif',
  hand: '"Caveat", "Comic Sans MS", cursive',
} as const

const headings = {
  fontFamily: fonts.display,
  fontWeight: 700,
  letterSpacing: '-0.025em',
  lineHeight: 1.1,
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.amber, dark: tokens.amberDark, contrastText: tokens.ink },
    secondary: { main: tokens.ink, contrastText: '#FFFFFF' },
    text: { primary: tokens.ink, secondary: tokens.inkMuted },
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
    divider: tokens.line,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: fonts.body,
    h1: { ...headings, fontSize: 'clamp(2.25rem, 5vw, 3.25rem)' },
    h2: { ...headings, fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)' },
    h3: { ...headings, fontSize: '1.5rem' },
    h4: { ...headings, fontSize: '1.25rem' },
    body1: { lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 18,
          variants: [
            {
              // amber button: darker bottom edge, as in the design
              props: { variant: 'contained', color: 'primary' },
              style: {
                boxShadow: `inset 0 -2px 0 ${tokens.amberDark}`,
                '&:hover': { backgroundColor: '#F39A36', boxShadow: `inset 0 -2px 0 ${tokens.amberDark}` },
              },
            },
          ],
        },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: { borderColor: tokens.line },
      },
    },
  },
})
