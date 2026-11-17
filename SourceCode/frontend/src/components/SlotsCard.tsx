import { Box, Paper, Skeleton, Typography } from '@mui/material'
import { currentMonth } from '../api/format'
import type { Product } from '../api/types'
import { fonts, tokens } from '../theme/theme'
import { Bead } from './Bead'
import { LeafSprig } from './nature/decorations'

/** Hand-drawn arrow + note under the card, as in the design. */
function BeadNote() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 2, ml: 1.5, color: tokens.link }}>
      <Box component="svg" viewBox="0 0 40 28" aria-hidden="true" sx={{ width: 34, flexShrink: 0, mt: 0.25 }}>
        <path d="M36 22 C 26 24, 12 20, 6 6 M6 6 L 4 14 M6 6 L 13 9" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </Box>
      <Typography sx={{ fontFamily: fonts.hand, fontSize: 20, lineHeight: 1.1, transform: 'rotate(-3deg)', mt: 0.5 }}>
        one bead = one project<br />I can take this month
      </Typography>
    </Box>
  )
}

/** "December · 12 slots open" with one bead per open slot across all packages. */
export function SlotsCard({ packages, loading }: { packages: Product[]; loading: boolean }) {
  const open = packages.reduce((sum, p) => sum + Math.max(p.stock ?? 0, 0), 0)
  return (
    <Box sx={{ position: 'relative' }}>
      {/* peeks out from behind the top corner of the card */}
      <LeafSprig size={104} sx={{ position: 'absolute', top: -60, right: { xs: -6, md: -30 }, transform: 'rotate(8deg)' }} />
      <Paper variant="outlined" sx={{ position: 'relative', p: 2.5, bgcolor: tokens.cream, borderRadius: 3 }}>
        <Typography variant="body2" color="text.secondary">{currentMonth()}</Typography>
        <Typography variant="h3" component="p" sx={{ mt: 0.5, mb: 1.5 }}>
          {loading ? <Skeleton width={140} /> : open === 0 ? 'Fully booked' : `${open} ${open === 1 ? 'slot' : 'slots'} open`}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, minHeight: 20 }}>
          {Array.from({ length: open }, (_, i) => <Bead key={i} size={18} />)}
        </Box>
      </Paper>
      <BeadNote />
    </Box>
  )
}
