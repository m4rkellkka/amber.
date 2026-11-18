import { useEffect, useRef, useState } from 'react'
import { Box, type SxProps, type Theme } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { dryLeaf, greens, grow, rng, sunlitGreens, type Grown } from './growth'
import { LeafShape, Vine } from './Vine'

/** Shared props of every decoration: purely visual, ignored by screen readers and the mouse. */
const decor = { 'aria-hidden': true, focusable: 'false' } as const
const base = { display: 'block', pointerEvents: 'none', overflow: 'visible' } as const
const extra = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : [sx])

const sway = keyframes`
  from { transform: rotate(-0.9deg); }
  to   { transform: rotate(0.9deg); }
`
const swaying = {
  transformOrigin: '50% 0',
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${sway} 9s ease-in-out infinite alternate`,
  },
} as const

/* ---------- lianas hanging down the page edges ---------- */

const hangingLeaves = { bendTo: 90, bendAmount: 0.45, berryChance: 0.04, tendrilChance: 0.07 } as const

const rightLiana: Grown[] = [
  grow({
    ...hangingLeaves, seed: 11, start: [96, -6], angle: 90, length: 1040, width: [4.2, 0.9], leafSize: [1.45, 0.75],
    branches: [{ at: 0.1, turn: -38, length: 240 }, { at: 0.34, turn: 34, length: 330 }, { at: 0.62, turn: -30, length: 210 }],
  }),
  grow({ ...hangingLeaves, seed: 23, start: [58, -6], angle: 92, length: 520, width: [2.6, 0.7], leafSize: [1.1, 0.6], berryChance: 0 }),
]

const leftLiana: Grown[] = [
  grow({
    ...hangingLeaves, seed: 37, start: [64, -6], angle: 88, length: 660, width: [3.6, 0.8], leafSize: [1.35, 0.7],
    branches: [{ at: 0.22, turn: 36, length: 220 }, { at: 0.55, turn: -30, length: 160 }],
  }),
  grow({ ...hangingLeaves, seed: 41, start: [104, -6], angle: 90, length: 300, width: [2.2, 0.7], leafSize: [1, 0.6], berryChance: 0 }),
]

/**
 * Long lianas hanging from the top of the page into the empty side margins.
 * They are anchored to the content column, so on narrower screens they slide out of view on their own.
 */
export function EdgeLianas() {
  const shared = { ...base, position: 'absolute', top: 0, width: 160, zIndex: 1, display: { xs: 'none', lg: 'block' }, ...swaying } as const
  return (
    <>
      <Box component="svg" viewBox="0 0 160 1100" {...decor}
           sx={{ ...shared, height: 1100, right: 'calc(50% - 744px)' }}>
        <Vine vines={rightLiana} />
      </Box>
      <Box component="svg" viewBox="0 0 160 700" {...decor}
           sx={{ ...shared, height: 700, left: 'calc(50% - 744px)', animationDelay: '-4s' }}>
        <Vine vines={leftLiana} />
      </Box>
    </>
  )
}

/* ---------- ivy creeping over a card corner ---------- */

const ivyLeaves = { kinds: ['ivy', 'ivy', 'ivy', 'pothos'], tendrilChance: 0.12, swayChance: 0.25 } as const

/** Seeded ivy that starts at the top-right corner (150, 20) and creeps left and down. */
function cornerIvy(seed: number): Grown[] {
  return [
    grow({ ...ivyLeaves, seed, start: [150, 20], angle: 182, length: 130, step: 12, wander: 12, pull: 0.3, width: [2.4, 0.6], leafSize: [1, 0.55], berryChance: 0.08 }),
    grow({ ...ivyLeaves, seed: seed + 1, start: [150, 20], angle: 94, length: 96, step: 12, wander: 12, pull: 0.3, width: [2.2, 0.6], leafSize: [0.95, 0.5] }),
    grow({ ...ivyLeaves, seed: seed + 2, start: [150, 20], angle: 140, length: 46, step: 10, wander: 10, width: [1.8, 0.6], leafSize: [0.9, 0.55], leafChance: 1 }),
  ]
}
const ivies = { slots: cornerIvy(101), work: cornerIvy(211), page: cornerIvy(307) } as const

/**
 * Ivy holding on to a card corner. Place it in a `position: relative` parent; it overlaps the corner.
 * `corner="tl"` mirrors it to the top-left.
 */
export function CornerIvy({ variant = 'slots', corner = 'tr', scale = 1, sx }: {
  variant?: keyof typeof ivies
  corner?: 'tl' | 'tr'
  scale?: number
  sx?: SxProps<Theme>
}) {
  const size = 170 * scale
  const offset = -20 * scale
  return (
    <Box component="svg" viewBox="0 0 170 170" {...decor}
         sx={[{
           ...base, position: 'absolute', zIndex: 2, width: size, height: size, top: offset,
           ...(corner === 'tr' ? { right: offset } : { left: offset, transform: 'scaleX(-1)' }),
         }, ...extra(sx)]}>
      <Vine vines={ivies[variant]} />
    </Box>
  )
}

/* ---------- section divider ---------- */

const divider: Grown[] = [
  grow({
    seed: 503, start: [8, 30], angle: 0, length: 620, step: 16, wander: 9, pull: 0.22, width: [2.6, 0.8],
    leafSize: [1.05, 0.65], leafChance: 0.75, berryChance: 0.05, tendrilChance: 0.08, swayChance: 0.2,
    branches: [{ at: 0.3, turn: -30, length: 60 }, { at: 0.7, turn: 28, length: 50 }],
  }),
]

function prefersStill(): boolean {
  return typeof window === 'undefined'
    || !('IntersectionObserver' in window)
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** A vine between sections. It grows once, the first time it scrolls into view. */
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
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [grown])

  return (
    <Box ref={ref} component="svg" viewBox="0 0 640 60" {...decor}
         sx={[{ ...base, width: '100%', maxWidth: 640, height: 'auto', mx: 'auto' }, ...extra(sx)]}>
      <Vine vines={divider} grown={grown} />
    </Box>
  )
}

/* ---------- small sprig (empty states) ---------- */

const sprig: Grown[] = [
  grow({ seed: 601, start: [16, 76], angle: -58, length: 74, step: 9, wander: 10, pull: 0.2, width: [2, 0.6], leafSize: [1, 0.65], leafChance: 0.9, berryChance: 0.1 }),
]

/** A short sprig; flip it to point the other way. */
export function LeafSprig({ size = 72, flip = false, sx }: { size?: number; flip?: boolean; sx?: SxProps<Theme> }) {
  return (
    <Box component="svg" viewBox="0 0 80 80" {...decor}
         sx={[{ ...base, width: size, height: size, transform: flip ? 'scaleX(-1)' : undefined }, ...extra(sx)]}>
      <Vine vines={sprig} />
    </Box>
  )
}

/* ---------- undergrowth along the top of the footer ---------- */

/**
 * Clumps of different size with uneven gaps between them, plus low runners creeping
 * sideways along the ground, so the edge reads as a hedge rather than a row of seedlings.
 */
function undergrowth(): Grown[] {
  const r = rng(900)
  const out: Grown[] = []
  let seed = 901
  let x = 20 + r() * 40
  while (x < 1440) {
    const big = r() < 0.3
    const shoots = big ? 5 + Math.floor(r() * 3) : 2 + Math.floor(r() * 3)
    const tallest = big ? 110 + r() * 40 : 40 + r() * 40
    for (let k = 0; k < shoots; k++) {
      const spread = (k / Math.max(1, shoots - 1) - 0.5) * (big ? 90 : 60)
      const len = tallest * (k === Math.floor(shoots / 2) ? 1 : 0.35 + r() * 0.5)
      out.push(grow({
        seed: seed++, start: [x + (r() - 0.5) * 18, 146], angle: -90 + spread + (r() - 0.5) * 16, length: len,
        step: 9, wander: 12, pull: 0.12, width: [len > 80 ? 2.8 : 1.9, 0.6], leafSize: [len > 80 ? 1.25 : 1, 0.6],
        leafChance: 0.85, palette: r() < 0.6 ? greens : sunlitGreens, bendTo: -90, bendAmount: 0.2,
        berryChance: big ? 0.04 : 0, tendrilChance: 0.06, swayChance: 0.2,
        branches: len > 90 ? [{ at: 0.35, turn: spread < 0 ? -38 : 38, length: len * 0.4 }] : undefined,
      }))
    }
    // A runner creeping along the ground toward the next clump.
    if (r() < 0.55) {
      const dir = r() < 0.5 ? -1 : 1
      out.push(grow({
        seed: seed++, start: [x, 146], angle: dir > 0 ? -14 : 194, length: 70 + r() * 90, step: 10, wander: 8, pull: 0.3,
        width: [1.8, 0.6], leafSize: [0.9, 0.55], leafChance: 0.9, bendTo: -90, bendAmount: 0.55, kinds: ['ivy', 'ivy', 'pothos'],
      }))
    }
    x += (big ? 120 : 60) + r() * 110
  }
  return out
}
const footerPlants = undergrowth()

/** Leaves growing up out of the footer band; stretches across the full width. */
export function FooterUndergrowth({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box component="svg" viewBox="0 0 1440 150" preserveAspectRatio="xMidYMax slice" {...decor}
         sx={[{ ...base, overflow: 'hidden', width: '100%', height: { xs: 96, md: 150 } }, ...extra(sx)]}>
      <Vine vines={footerPlants} />
    </Box>
  )
}

/* ---------- drooping vine (404) ---------- */

const drooping: Grown[] = [
  grow({
    seed: 707, start: [60, -2], angle: 90, length: 180, step: 13, wander: 18, pull: 0.1, width: [3, 0.8],
    leafSize: [1.2, 0.8], bendTo: 100, bendAmount: 0.7, leafChance: 0.7,
    palette: ['#5A7F3E', '#6F8F4E', '#8A9A3C', '#A3B574', dryLeaf, dryLeaf], tendrilChance: 0.15,
  }),
]

/** A tired vine with dry leaves and one that already fell. For the "page not found" screen. */
export function DroopingVine({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box component="svg" viewBox="0 0 120 230" {...decor}
         sx={[{ ...base, width: 120, height: 230 }, ...extra(sx)]}>
      <Vine vines={drooping} />
      <g transform="translate(74 220) rotate(-14) scale(0.95)"><LeafShape kind="pothos" fill={dryLeaf} /></g>
    </Box>
  )
}

/* ---------- list bullet ---------- */

/** A single small leaf, used as a list bullet. */
export function LeafBullet({ size = 14 }: { size?: number }) {
  return (
    <Box component="svg" viewBox="-2 -12 28 24" {...decor}
         sx={{ ...base, width: size, height: size, flexShrink: 0, transform: 'rotate(-35deg)' }}>
      <LeafShape kind="pothos" />
    </Box>
  )
}
