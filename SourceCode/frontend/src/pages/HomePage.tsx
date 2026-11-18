import { useState } from 'react'
import { Box, Button, Container, Link, Typography } from '@mui/material'
import { AskDialog } from '../components/AskDialog'
import { AddonChips } from '../components/AddonChips'
import { PackagesTable } from '../components/PackagesTable'
import { RecentWork } from '../components/RecentWork'
import { SlotsCard } from '../components/SlotsCard'
import { VineDivider } from '../components/nature/decorations'
import { useCatalog } from '../hooks/useCatalog'
import { usePageTitle } from '../hooks/usePageTitle'
import { tokens } from '../theme/theme'

/** Hand-drawn amber underline under a phrase, as in the design. */
function Underlined({ children }: { children: string }) {
  return (
    <Box component="span" sx={{ position: 'relative', fontStyle: 'italic', fontWeight: 500, whiteSpace: { xs: 'normal', sm: 'nowrap' } }}>
      {children}
      {/* A brush stroke: thick in the middle, thin at the ends, with a second lighter pass. */}
      <Box component="svg" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"
           sx={{ position: 'absolute', left: '-2%', bottom: '-0.14em', width: '104%', height: '0.32em', overflow: 'visible' }}>
        <path d="M3 10 C 60 5.5, 150 3, 296 6.5 C 298 7.5, 297 8.6, 295 8.6 C 160 6.6, 70 9.4, 4 12.4 C 1.5 12.6, 1 10.6, 3 10 Z" fill={tokens.amber} />
        <path d="M30 9.2 C 110 6.4, 200 5.6, 270 7" fill="none" stroke={tokens.amberHover} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      </Box>
    </Box>
  )
}

export function HomePage() {
  const { packages, addons, loading, error, reload } = useCatalog()
  const [askOpen, setAskOpen] = useState(false)
  usePageTitle(null)

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 9 } }}>
      <Box sx={{
        display: 'grid', gap: { xs: 5, md: 8 }, alignItems: 'start',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 300px' },
      }}>
        <Box>
          <Typography variant="h1" sx={{ mb: 3, maxWidth: 700 }}>
            I build websites and chatbots for <Underlined>small businesses</Underlined> in Istanbul.
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 460, mb: 4 }}>
            A lot of my work is for hotels and cafés: they come for a website and often stay for a bot
            that answers guests at night. Pick a package below and follow your order step by step in your account.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" href="#packages">Choose a package</Button>
            <Link component="button" type="button" underline="always" onClick={() => setAskOpen(true)}
                  disabled={packages.length === 0}
                  sx={{ color: tokens.link, fontWeight: 500, fontSize: 16 }}>
              Ask me something first
            </Link>
          </Box>
        </Box>
        <SlotsCard packages={packages} loading={loading} />
      </Box>

      <Box sx={{ mt: { xs: 10, md: 14 } }}><RecentWork /></Box>
      <VineDivider sx={{ mt: { xs: 7, md: 10 }, mb: { xs: 5, md: 7 } }} />
      <Box>
        <PackagesTable packages={packages} loading={loading} error={error} onRetry={reload} />
      </Box>
      <Box sx={{ mt: 6 }}><AddonChips addons={addons} /></Box>
      <AskDialog open={askOpen} onClose={() => setAskOpen(false)} packages={packages} />
    </Container>
  )
}
