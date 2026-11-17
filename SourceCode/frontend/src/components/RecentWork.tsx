import { Box, Typography } from '@mui/material'
import { content } from '../content'
import { tokens } from '../theme/theme'

type Work = (typeof content.recentWork)[number]

function Tile({ work, height }: { work: Work; height: number | Record<string, number> }) {
  return (
    <Box>
      <Box sx={{
        height, borderRadius: 3, overflow: 'hidden', bgcolor: tokens.sand,
        border: `1px dashed ${tokens.line}`, display: 'grid', placeItems: 'center',
      }}>
        {work.image
          ? <Box component="img" src={work.image} alt={work.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Typography variant="body2" color="text.secondary">[{work.placeholder}]</Typography>}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{work.title}</Typography>
        <Typography variant="body2" color="text.secondary">{work.meta}</Typography>
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
        <Tile work={main} height={{ xs: 200, md: 300 }} />
        <Box sx={{ display: 'grid', gap: 2 }}>
          {rest.map((w) => <Tile key={w.title} work={w} height={{ xs: 160, md: 128 }} />)}
        </Box>
      </Box>
    </Box>
  )
}
