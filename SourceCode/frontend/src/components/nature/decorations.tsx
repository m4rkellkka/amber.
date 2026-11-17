import { useEffect, useRef, useState } from 'react'
import { Box, type SxProps, type Theme } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { LeafShape, Vine, type StemSpec } from './Vine'

/** Shared props of every decoration: purely visual, ignored by screen readers and the mouse. */
const decor = { 'aria-hidden': true, focusable: 'false' } as const
const base = { display: 'block', pointerEvents: 'none', overflow: 'visible' } as const

const sway = keyframes`
  from { transform: rotate(-1.6deg); }
  to   { transform: rotate(1.6deg); }
`

/* ---------- hanging vine (header) ---------- */

const hanging: StemSpec[] = [
  {
    width: 1.4, leafScale: 1.35,
    segs: [
      [[62, -2], [74, 26], [84, 50], [77, 88]],
      [[77, 88], [71, 118], [86, 132], [82, 152]],
    ],
    leaves: [
      { s: 0, t: 0.35, side: -1, size: 0.8, tone: 2 },
      { s: 0, t: 0.7, side: 1, size: 0.75, tone: 1 },
      { s: 1, t: 0.25, side: -1, size: 0.65, tone: 2, tilt: 10 },
      { s: 1, t: 0.7, side: 1, size: 0.55, tone: 1 },
    ],
    curls: [{ s: 1, t: 1, rot: 70, size: 0.9 }],
  },
  {
    width: 2.2, leafScale: 1.4,
    segs: [
      [[56, -2], [52, 30], [66, 52], [60, 84]],
      [[60, 84], [54, 116], [42, 140], [50, 172]],
      [[50, 172], [58, 204], [66, 228], [57, 262]],
    ],
    leaves: [
      { s: 0, t: 0.18, side: 1, size: 1.15, tone: 0 },
      { s: 0, t: 0.45, side: -1, size: 1.25, tone: 1, tilt: -8 },
      { s: 0, t: 0.8, side: 1, size: 1.1, tone: 0, tilt: 6 },
      { s: 1, t: 0.15, side: -1, size: 1.2, tone: 0 },
      { s: 1, t: 0.45, side: 1, size: 1.0, tone: 2, tilt: -10 },
      { s: 1, t: 0.75, side: -1, size: 1.05, tone: 1 },
      { s: 2, t: 0.1, side: 1, size: 0.95, tone: 0 },
      { s: 2, t: 0.4, side: -1, size: 0.85, tone: 1, tilt: 8 },
      { s: 2, t: 0.68, side: 1, size: 0.7, tone: 2 },
      { s: 2, t: 0.9, side: -1, size: 0.55, tone: 1 },
      { s: 2, t: 1, side: 0, size: 0.5, tone: 1 },
    ],
    berries: [
      { s: 1, t: 0.55, dx: -9, dy: 4, r: 3.4 },
      { s: 1, t: 0.6, dx: -4, dy: 9, r: 2.8 },
      { s: 2, t: 0.25, dx: 8, dy: 2, r: 2.6 },
    ],
    curls: [{ s: 1, t: 0.95, rot: 160, size: 1 }],
  },
]

/**
 * A vine hanging from the top of the page into the right-hand margin.
 * Only shown on wide screens, where that margin is empty; sways slowly.
 */
export function HangingVine({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box component="svg" viewBox="0 0 110 270" {...decor}
         sx={[{
           ...base, width: 128, height: 314, transformOrigin: '50% 0',
           '@media (prefers-reduced-motion: no-preference)': {
             animation: `${sway} 8s ease-in-out infinite alternate`,
           },
         }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Vine stems={hanging} />
    </Box>
  )
}

/* ---------- section divider ---------- */

const divider: StemSpec[] = [
  {
    width: 2, leafScale: 1.7,
    segs: [
      [[8, 30], [60, 14], [110, 44], [170, 30]],
      [[170, 30], [230, 16], [270, 42], [320, 28]],
      [[320, 28], [370, 16], [420, 42], [480, 30]],
      [[480, 30], [540, 18], [590, 40], [632, 26]],
    ],
    leaves: [
      { s: 0, t: 0.3, side: -1, size: 0.75, tone: 2 },
      { s: 0, t: 0.62, side: 1, size: 0.9, tone: 1 },
      { s: 1, t: 0.05, side: -1, size: 1.0, tone: 0 },
      { s: 1, t: 0.45, side: 1, size: 0.95, tone: 0, tilt: -6 },
      { s: 1, t: 0.8, side: -1, size: 0.8, tone: 2 },
      { s: 2, t: 0.2, side: 1, size: 1.05, tone: 1 },
      { s: 2, t: 0.55, side: -1, size: 0.9, tone: 0, tilt: 8 },
      { s: 2, t: 0.9, side: 1, size: 0.8, tone: 2 },
      { s: 3, t: 0.3, side: -1, size: 0.75, tone: 1 },
      { s: 3, t: 0.65, side: 1, size: 0.6, tone: 0 },
      { s: 3, t: 1, side: 0, size: 0.5, tone: 1 },
    ],
    berries: [
      { s: 1, t: 0.62, dx: 2, dy: -9, r: 3.2 },
      { s: 1, t: 0.7, dx: 8, dy: -5, r: 2.6 },
    ],
    curls: [
      { s: 0, t: 0.05, rot: 150, size: 0.9 },
      { s: 2, t: 0.7, rot: -40, size: 0.8 },
    ],
  },
]

function prefersStill(): boolean {
  return typeof window === 'undefined'
    || !('IntersectionObserver' in window)
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** A thin vine between sections. It grows once, the first time it scrolls into view. */
export function VineDivider({ sx }: { sx?: SxProps<Theme> }) {
  const ref = useRef<SVGSVGElement>(null)
  const [grown, setGrown] = useState(prefersStill)

  useEffect(() => {
    const el = ref.current
    if (grown || !el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setGrown(true)
        io.disconnect()
      }
    }, { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [grown])

  return (
    <Box ref={ref} component="svg" viewBox="0 0 640 56" {...decor}
         sx={[{ ...base, width: '100%', maxWidth: 640, height: 'auto', mx: 'auto' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Vine stems={divider} grown={grown} />
    </Box>
  )
}

/* ---------- small sprig (card corners, empty states) ---------- */

const sprig: StemSpec[] = [
  {
    width: 1.7, leafScale: 1.25,
    segs: [[[8, 76], [20, 58], [34, 42], [62, 16]]],
    leaves: [
      { s: 0, t: 0.22, side: 1, size: 0.95, tone: 2 },
      { s: 0, t: 0.38, side: -1, size: 1.1, tone: 0 },
      { s: 0, t: 0.58, side: 1, size: 1.05, tone: 1 },
      { s: 0, t: 0.76, side: -1, size: 0.9, tone: 0, tilt: 6 },
      { s: 0, t: 1, side: 0, size: 0.8, tone: 1 },
    ],
    berries: [{ s: 0, t: 0.45, dx: 7, dy: 5, r: 2.8 }],
  },
]

/** A short sprig with five leaves; flip it to point the other way. */
export function LeafSprig({ size = 72, flip = false, sx }: { size?: number; flip?: boolean; sx?: SxProps<Theme> }) {
  return (
    <Box component="svg" viewBox="0 0 80 80" {...decor}
         sx={[{ ...base, width: size, height: size, transform: flip ? 'scaleX(-1)' : undefined },
           ...(Array.isArray(sx) ? sx : [sx])]}>
      <Vine stems={sprig} />
    </Box>
  )
}

/* ---------- vines rising from the footer ---------- */

const clump: StemSpec[] = [
  {
    width: 1.6, leafScale: 1.35,
    segs: [[[58, 112], [44, 98], [30, 88], [20, 66]]],
    leaves: [
      { s: 0, t: 0.35, side: 1, size: 0.85, tone: 2 },
      { s: 0, t: 0.65, side: -1, size: 0.8, tone: 1 },
      { s: 0, t: 1, side: 0, size: 0.6, tone: 2 },
    ],
  },
  {
    width: 1.6, leafScale: 1.35,
    segs: [[[62, 112], [70, 90], [84, 76], [94, 50]]],
    leaves: [
      { s: 0, t: 0.3, side: -1, size: 0.9, tone: 1 },
      { s: 0, t: 0.62, side: 1, size: 0.85, tone: 0 },
      { s: 0, t: 1, side: 0, size: 0.65, tone: 1 },
    ],
    curls: [{ s: 0, t: 0.85, rot: -120, size: 0.8 }],
  },
  {
    width: 2.1, leafScale: 1.4,
    segs: [[[60, 112], [52, 84], [66, 62], [54, 34]], [[54, 34], [48, 20], [52, 10], [58, 2]]],
    leaves: [
      { s: 0, t: 0.25, side: -1, size: 1.1, tone: 0 },
      { s: 0, t: 0.5, side: 1, size: 1.15, tone: 1 },
      { s: 0, t: 0.78, side: -1, size: 1.0, tone: 0 },
      { s: 1, t: 0.3, side: 1, size: 0.8, tone: 2 },
      { s: 1, t: 1, side: 0, size: 0.6, tone: 1 },
    ],
    berries: [{ s: 0, t: 0.55, dx: -8, dy: -2, r: 3 }],
  },
]

/** A clump of stems growing up out of the footer band. */
export function FooterClump({ height = 110, flip = false, sx }: { height?: number; flip?: boolean; sx?: SxProps<Theme> }) {
  return (
    <Box component="svg" viewBox="0 0 120 112" {...decor}
         sx={[{ ...base, height, width: (height * 120) / 112, transform: flip ? 'scaleX(-1)' : undefined },
           ...(Array.isArray(sx) ? sx : [sx])]}>
      <Vine stems={clump} />
    </Box>
  )
}

/* ---------- drooping vine (404) ---------- */

const drooping: StemSpec[] = [
  {
    width: 2, leafScale: 1.3,
    segs: [
      [[60, -2], [60, 40], [72, 70], [58, 100]],
      [[58, 100], [46, 126], [40, 150], [50, 168]],
    ],
    leaves: [
      { s: 0, t: 0.2, side: 1, size: 1.1, tone: 0 },
      { s: 0, t: 0.5, side: -1, size: 1.15, tone: 1 },
      { s: 0, t: 0.85, side: 1, size: 1.0, tone: 2 },
      { s: 1, t: 0.3, side: -1, size: 0.9, tone: 1, tilt: 20 },
      { s: 1, t: 0.7, side: 1, size: 0.85, tone: 3, tilt: 35 },
    ],
    curls: [{ s: 1, t: 1, rot: 100, size: 0.9 }],
  },
]

/** A tired vine with one dry leaf and one that already fell. For the "page not found" screen. */
export function DroopingVine({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box component="svg" viewBox="0 0 120 220" {...decor}
         sx={[{ ...base, width: 120, height: 220 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Vine stems={drooping} />
      <g transform="translate(70 208) rotate(-14) scale(0.95)"><LeafShape tone={3} /></g>
    </Box>
  )
}

/* ---------- list bullet ---------- */

/** A single small leaf, used as a list bullet. */
export function LeafBullet({ size = 14 }: { size?: number }) {
  return (
    <Box component="svg" viewBox="-2 -12 28 24" {...decor}
         sx={{ ...base, width: size, height: size, flexShrink: 0, transform: 'rotate(-35deg)' }}>
      <LeafShape tone={0} />
    </Box>
  )
}
