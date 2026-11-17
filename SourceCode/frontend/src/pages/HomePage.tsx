import { Box, Button, Container, Link, Typography } from '@mui/material'
import { tokens } from '../theme/theme'

/** Hand-drawn amber underline under a phrase, as in the design. */
function Underlined({ children }: { children: string }) {
  return (
    <Box component="span" sx={{ position: 'relative', whiteSpace: 'nowrap' }}>
      {children}
      <Box component="svg" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true"
           sx={{ position: 'absolute', left: 0, bottom: '-0.12em', width: '100%', height: '0.28em', overflow: 'visible' }}>
        <path d="M2 9 C 70 3, 160 2, 298 6" fill="none" stroke={tokens.amber} strokeWidth="3.5" strokeLinecap="round" />
      </Box>
    </Box>
  )
}

export function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 640 }}>
        <Typography variant="h1" sx={{ mb: 3 }}>
          I build websites and chatbots for <Underlined>small businesses</Underlined> in Istanbul.
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 440, mb: 4 }}>
          A lot of my work is for hotels and cafés: they come for a website and often stay for a bot
          that answers guests at night. Pick a package below and follow your order step by step in your account.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Button variant="contained" size="large" href="#packages">Choose a package</Button>
          <Link href="#packages" underline="always" sx={{ color: tokens.link, fontWeight: 500 }}>
            Ask me something first
          </Link>
        </Box>
      </Box>
    </Container>
  )
}
