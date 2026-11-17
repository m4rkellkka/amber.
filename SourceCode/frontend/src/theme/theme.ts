import { createTheme } from '@mui/material/styles'

/** Design tokens of the "amber" direction: warm paper, amber accent, dark brown ink, garden greens. */
export const tokens = {
  amber: '#EF8A1E',
  amberDark: '#C9690C',
  amberHover: '#F39A36',
  ink: '#1E1710',
  inkMuted: '#6E6153',
  link: '#4F6B3A',
  cream: '#FFFBF5',
  sand: '#F3EBDC',
  line: '#E7DCCB',
  stone: '#CBBBA8',
  paper: '#FBF6EC',
  moss: '#4F6B3A',
  leaf: '#6F8F4E',
  sage: '#A9B98F',
  sageWash: '#E6EBD8',
  forest: '#26331F',
} as const

export const fonts = {
  display: '"Bricolage Grotesque", "Geist", system-ui, sans-serif',
  body: '"Geist", system-ui, -apple-system, "Segoe UI", sans-serif',
  hand: '"Caveat", "Comic Sans MS", cursive',
} as const

/** Soft warm shadow for cards that sit on the paper background. */
export const cardShadow = '0 1px 2px rgba(60, 40, 10, 0.05), 0 8px 24px rgba(60, 40, 10, 0.06)'

/** Faint paper grain: a tiny SVG noise tile, tinted brown. */
const grain = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>" +
  "<feColorMatrix values='0 0 0 0 0.36 0 0 0 0 0.25 0 0 0 0 0.12 0 0 0 0.9 0'/></filter>" +
  "<rect width='100%' height='100%' filter='url(#n)' opacity='0.09'/></svg>",
)}")`

const headings = {
  fontFamily: fonts.display,
  fontWeight: 600,
  letterSpacing: '-0.015em',
  lineHeight: 1.12,
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.amber, dark: tokens.amberDark, contrastText: tokens.ink },
    secondary: { main: tokens.ink, contrastText: '#FFFFFF' },
    success: { main: tokens.moss },
    text: { primary: tokens.ink, secondary: tokens.inkMuted },
    background: { default: tokens.paper, paper: tokens.cream },
    divider: tokens.line,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: fonts.body,
    h1: { ...headings, fontSize: 'clamp(2.25rem, 5vw, 3.25rem)' },
    h2: { ...headings, fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)' },
    h3: { ...headings, fontSize: '1.5rem' },
    h4: { ...headings, fontSize: '1.25rem' },
    body1: { fontSize: '1.0625rem', lineHeight: 1.7 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.paper,
          backgroundImage: grain,
        },
        '::selection': { backgroundColor: tokens.sageWash },
        // People who turn off motion in system settings get a still page.
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
          variants: [
            {
              props: { variant: 'contained', color: 'primary' },
              style: { '&:hover': { backgroundColor: tokens.amberHover } },
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
        outlined: { borderColor: 'rgba(110, 80, 40, 0.10)', boxShadow: cardShadow },
      },
    },
  },
})
