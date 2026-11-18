import { useLocation } from 'react-router'
import { Box, Container, Typography } from '@mui/material'
import { softSerif, tokens } from '../theme/theme'
import { FooterUndergrowth } from './nature/decorations'

/** Wavy top edge of the footer band. */
function Wave() {
  return (
    <Box component="svg" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true"
         sx={{ position: 'absolute', left: 0, bottom: '100%', width: '100%', height: { xs: 20, md: 32 }, display: 'block' }}>
      <path d="M0 40 L0 22 C 180 6, 360 30, 560 18 S 920 2, 1120 16 S 1340 30, 1440 12 L1440 40 Z" fill={tokens.forest} />
    </Box>
  )
}

export function Footer() {
  // The admin panel is a work tool: it keeps the colors but gets no plants.
  const plants = !useLocation().pathname.startsWith('/admin')
  return (
    <Box component="footer" sx={{ position: 'relative', zIndex: 2, mt: plants ? { xs: 16, md: 20 } : 10, bgcolor: tokens.forest, color: tokens.paper }}>
      <Wave />
      {plants && (
        <FooterUndergrowth sx={{ position: 'absolute', left: 0, bottom: { xs: 'calc(100% - 14px)', md: 'calc(100% - 22px)' } }} />
      )}
      <Container maxWidth="lg">
        <Box sx={{
          py: { xs: 4, md: 5 },
          display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'baseline', justifyContent: 'space-between',
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(251, 246, 236, 0.78)' }}>amber — Mikhail, Istanbul</Typography>
          <Typography sx={{ ...softSerif, fontStyle: 'italic', fontSize: 18, lineHeight: 1.2, color: tokens.sage }}>
            made slowly, with plants nearby
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
