import { Box, Typography } from '@mui/material'
import { content, type Work } from '../content'
import { cardShadow, tokens } from '../theme/theme'
import { CornerIvy, LeafBullet } from './nature/decorations'

/** Small spaced-out label with a leaf, above a section title. */
export function Eyebrow({ children }: { children: string }) {
  return (
    <Typography component="p" sx={{
      display: 'flex', alignItems: 'center', gap: 1, mb: 1,
      fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: tokens.terracotta,
    }}>
      <LeafBullet size={14} />
      {children}
    </Typography>
  )
}

/** Torn ends for the tape, as a clip path. */
const tornEnds = 'polygon(0 8%, 4% 0, 96% 4%, 100% 14%, 97% 38%, 100% 62%, 96% 100%, 3% 92%, 0 70%, 3% 46%)'

/** A strip of washi tape holding the print. */
function Tape({ tilt, color, left = '50%' }: { tilt: number; color: string; left?: string }) {
  return (
    <Box aria-hidden="true" sx={{
      position: 'absolute', top: -12, left, width: 92, height: 24, zIndex: 1,
      transform: `translateX(-50%) rotate(${tilt}deg)`, clipPath: tornEnds,
      bgcolor: color, mixBlendMode: 'multiply',
    }} />
  )
}

/** A work screenshot as a slightly tilted photo print with a caption under it. */
function Print({ work, height, tilt, tape, dark = false, ivy = false, position = 'top' }: {
  work: Work
  height: number | Record<string, number>
  tilt: number
  tape?: { color: string; tilt: number; left?: string }
  /** Mount on dark card stock (for dark screenshots). */
  dark?: boolean
  ivy?: boolean
  position?: string
}) {
  return (
    <Box component="figure" sx={{
      position: 'relative', m: 0, p: 1, pb: 1.25, bgcolor: dark ? '#2B241C' : '#FFFDF8', borderRadius: '4px', boxShadow: cardShadow,
      color: dark ? 'rgba(251, 246, 236, 0.92)' : undefined,
      transform: `rotate(${tilt}deg)`, transition: 'transform .4s ease, box-shadow .4s ease',
      '&:hover': { transform: 'rotate(0deg) translateY(-3px)', boxShadow: '0 2px 4px rgba(60,40,10,.06), 0 14px 32px rgba(60,40,10,.10)' },
    }}>
      {tape && <Tape {...tape} />}
      {ivy && <CornerIvy variant="work" corner="tl" scale={0.85} sx={{ display: { xs: 'none', sm: 'block' } }} />}
      <Box sx={{ height, borderRadius: '3px', overflow: 'hidden', bgcolor: tokens.sand }}>
        <Box component="img" src={work.image} alt={work.alt} loading="lazy" decoding="async"
             sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, display: 'block' }} />
      </Box>
      <Box component="figcaption" sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 1, px: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{work.title}</Typography>
        <Typography variant="body2" sx={{ textAlign: 'right', color: dark ? 'rgba(251, 246, 236, 0.66)' : 'text.secondary' }}>{work.meta}</Typography>
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
        <Print work={main} height={{ xs: 240, md: 340 }} tilt={-1.1} dark ivy position="center 45%"
               tape={{ color: 'rgba(241, 217, 160, 0.85)', tilt: 3, left: '62%' }} />
        <Box sx={{ display: 'grid', gap: { xs: 3, md: 4 }, pt: { md: 1 } }}>
          {rest.map((w, i) => (
            <Print key={w.title} work={w} height={{ xs: 220, md: 124 }} tilt={i % 2 ? -1.6 : 1.4}
                   tape={i % 2 ? { color: 'rgba(201, 211, 168, 0.85)', tilt: -4, left: '30%' } : undefined} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
