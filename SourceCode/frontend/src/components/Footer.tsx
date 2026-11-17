import { Box, Container, Typography } from '@mui/material'
import { fonts, tokens } from '../theme/theme'
import { FooterClump } from './nature/decorations'

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
  return (
    <Box component="footer" sx={{ position: 'relative', mt: { xs: 24, md: 27 }, bgcolor: tokens.forest, color: tokens.paper }}>
      <Wave />
      <FooterClump height={150} sx={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: { xs: '4%', md: '7%' } }} />
      <FooterClump height={108} flip
                   sx={{ position: 'absolute', bottom: 'calc(100% + 10px)', right: '9%', display: { xs: 'none', sm: 'block' } }} />
      <Container maxWidth="lg">
        <Box sx={{
          py: { xs: 4, md: 5 },
          display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'baseline', justifyContent: 'space-between',
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(251, 246, 236, 0.78)' }}>amber — Mikhail, Istanbul</Typography>
          <Typography sx={{ fontFamily: fonts.hand, fontSize: 22, lineHeight: 1.2, color: tokens.sage }}>
            made slowly, with plants nearby
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
