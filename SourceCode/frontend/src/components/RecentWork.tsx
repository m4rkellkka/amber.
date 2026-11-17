import { Box, Typography } from '@mui/material'
import { content, type Work } from '../content'
import { tokens } from '../theme/theme'

function Tile({ work, height, position = 'top' }: {
  work: Work
  height: number | Record<string, number>
  position?: string
}) {
  return (
    <Box component="figure" sx={{ m: 0 }}>
      <Box sx={{ height, borderRadius: 3, overflow: 'hidden', bgcolor: tokens.sand, border: 1, borderColor: 'divider' }}>
        <Box component="img" src={work.image} alt={work.alt} loading="lazy" decoding="async"
             sx={{
               width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, display: 'block',
               transition: 'transform .4s ease', '&:hover': { transform: 'scale(1.02)' },
             }} />
      </Box>
      <Box component="figcaption" sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{work.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>{work.meta}</Typography>
      </Box>
    </Box>
  )
}

export function RecentWork() {
  const [main, ...rest] = content.recentWork
  return (
    <Box component="section" id="work" sx={{ scrollMarginTop: 24 }}>
      <Typography variant="h2" sx={{ mb: 3 }}>Recent work</Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
        <Tile work={main} height={{ xs: 220, md: 372 }} position="center 45%" />
        <Box sx={{ display: 'grid', gap: 2 }}>
          {rest.map((w) => <Tile key={w.title} work={w} height={{ xs: 200, md: 150 }} />)}
        </Box>
      </Box>
    </Box>
  )
}
