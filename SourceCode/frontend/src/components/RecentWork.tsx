import { Box, Typography } from '@mui/material'
import { content, type Work } from '../content'
import { cardShadow, fonts, tokens } from '../theme/theme'

/** Small handwritten line above a section title. */
export function Eyebrow({ children }: { children: string }) {
  return (
    <Typography component="p" sx={{
      fontFamily: fonts.hand, fontSize: 24, lineHeight: 1, color: tokens.moss,
      transform: 'rotate(-2deg)', transformOrigin: 'left', mb: 0.5,
    }}>
      {children}
    </Typography>
  )
}

/** A piece of paper tape holding the print. */
function Tape({ tilt }: { tilt: number }) {
  return (
    <Box aria-hidden="true" sx={{
      position: 'absolute', top: -11, left: '50%', width: 86, height: 22, zIndex: 1,
      transform: `translateX(-50%) rotate(${tilt}deg)`,
      bgcolor: 'rgba(230, 235, 216, 0.82)', boxShadow: '0 1px 2px rgba(60, 40, 10, 0.08)',
    }} />
  )
}

/** A work screenshot as a slightly tilted photo print with a caption under it. */
function Print({ work, height, tilt, tape = false, position = 'top' }: {
  work: Work
  height: number | Record<string, number>
  tilt: number
  tape?: boolean
  position?: string
}) {
  return (
    <Box component="figure" sx={{
      position: 'relative', m: 0, p: 1, pb: 1.25, bgcolor: '#FFFDF8', borderRadius: '6px', boxShadow: cardShadow,
      transform: `rotate(${tilt}deg)`, transition: 'transform .4s ease, box-shadow .4s ease',
      '&:hover': { transform: 'rotate(0deg) translateY(-3px)', boxShadow: '0 2px 4px rgba(60,40,10,.06), 0 14px 32px rgba(60,40,10,.10)' },
    }}>
      {tape && <Tape tilt={-tilt * 2 - 3} />}
      <Box sx={{ height, borderRadius: '3px', overflow: 'hidden', bgcolor: tokens.sand }}>
        <Box component="img" src={work.image} alt={work.alt} loading="lazy" decoding="async"
             sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, display: 'block' }} />
      </Box>
      <Box component="figcaption" sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 1, px: 0.5 }}>
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
      <Eyebrow>things I made lately</Eyebrow>
      <Typography variant="h2" sx={{ mb: 4 }}>Recent work</Typography>
      <Box sx={{ display: 'grid', gap: { xs: 3, md: 3.5 }, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
        <Print work={main} height={{ xs: 240, md: 340 }} tilt={-0.6} tape position="center 45%" />
        <Box sx={{ display: 'grid', gap: { xs: 3, md: 3.5 } }}>
          {rest.map((w, i) => <Print key={w.title} work={w} height={{ xs: 220, md: 124 }} tilt={i % 2 ? -1 : 1.2} />)}
        </Box>
      </Box>
    </Box>
  )
}
