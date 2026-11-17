import { tokens } from '../../theme/theme'

/** A point in SVG user units. */
export type Pt = readonly [number, number]
/** One cubic Bezier piece of a stem: start, two control points, end. */
export type Seg = readonly [Pt, Pt, Pt, Pt]

/** Leaf tones: deep moss, leaf green, pale sage, dry (wilted). */
const leafFills = [tokens.moss, tokens.leaf, tokens.sage, '#C8A576'] as const
const veinColors = ['rgba(230, 235, 216, 0.45)', 'rgba(230, 235, 216, 0.4)', 'rgba(79, 107, 58, 0.45)', 'rgba(120, 80, 30, 0.4)']

export interface LeafSpec {
  /** Index of the stem piece the leaf grows on. */
  s: number
  /** Position along that piece, 0..1. */
  t: number
  /** Which side of the stem: 1 or -1, 0 = continues the stem (tip leaf). */
  side: 1 | -1 | 0
  /** Scale; 1 is a ~24 unit long leaf. */
  size: number
  tone?: 0 | 1 | 2 | 3
  /** Extra angle in degrees, for a less regular look. */
  tilt?: number
}

export interface BerrySpec {
  s: number
  t: number
  dx: number
  dy: number
  r: number
}

export interface StemSpec {
  segs: readonly Seg[]
  width: number
  /** Multiplies every leaf size on this stem (default 1). */
  leafScale?: number
  leaves: readonly LeafSpec[]
  berries?: readonly BerrySpec[]
  /** Little curls: stem piece, position, rotation in degrees, scale. */
  curls?: readonly { s: number; t: number; rot: number; size: number }[]
}

function at(seg: Seg, t: number): Pt {
  const u = 1 - t
  const [a, b, c, d] = seg
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ]
}

/** Direction of the stem at t, in degrees. */
function heading(seg: Seg, t: number): number {
  const u = 1 - t
  const [a, b, c, d] = seg
  const dx = 3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0])
  const dy = 3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1])
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

function stemPath(segs: readonly Seg[]): string {
  const [first] = segs
  return `M${first[0].join(' ')} ` + segs.map(([, b, c, d]) => `C${b.join(' ')} ${c.join(' ')} ${d.join(' ')}`).join(' ')
}

/** One leaf, base at (0,0), pointing along +x. Slightly asymmetric so it reads as hand-drawn. */
export function LeafShape({ tone = 0 }: { tone?: 0 | 1 | 2 | 3 }) {
  return (
    <>
      <path d="M0 0 C5 -7.5 15 -10 24 -1 C16 6 6.5 6 0 0 Z" fill={leafFills[tone]} />
      <path d="M0.8 0 C8 -1.6 15.5 -2.6 22.5 -1.2" fill="none" stroke={veinColors[tone]} strokeWidth="0.8" strokeLinecap="round" />
    </>
  )
}

interface VineProps {
  stems: readonly StemSpec[]
  /**
   * undefined: drawn as is. false/true: the stem is hidden/drawn and leaves appear one by one,
   * which lets a parent "grow" the vine when it scrolls into view.
   */
  grown?: boolean
  /** Seconds the grow animation takes. */
  growTime?: number
}

/** Renders stems with their leaves, berries and curls inside an <svg>. */
export function Vine({ stems, grown, growTime = 1.8 }: VineProps) {
  const animated = grown !== undefined
  return (
    <>
      {stems.map((stem, si) => {
        const n = stem.segs.length
        const delay = (s: number, t: number) => ((s + t) / n) * growTime * 0.9
        return (
          <g key={si}>
            <path d={stemPath(stem.segs)} fill="none" stroke={tokens.moss} strokeWidth={stem.width}
                  strokeLinecap="round" pathLength={1}
                  style={animated ? {
                    strokeDasharray: 1, strokeDashoffset: grown ? 0 : 1,
                    transition: `stroke-dashoffset ${growTime}s cubic-bezier(.45,.05,.35,1)`,
                  } : undefined} />
            {stem.curls?.map((c, i) => {
              const [x, y] = at(stem.segs[c.s], c.t)
              return (
                <path key={`c${i}`} d="M0 0 C5 -1 9 2 8.5 6 C8 9.5 4 10 2.6 7.6 C1.6 5.8 3.4 4.2 5 5.2"
                      transform={`translate(${x} ${y}) rotate(${c.rot}) scale(${c.size})`}
                      fill="none" stroke={tokens.moss} strokeWidth={0.9 / c.size} strokeLinecap="round"
                      style={animated ? { opacity: grown ? 1 : 0, transition: `opacity .6s ${delay(c.s, c.t)}s` } : undefined} />
              )
            })}
            {stem.leaves.map((l, i) => {
              const [x, y] = at(stem.segs[l.s], l.t)
              const angle = heading(stem.segs[l.s], l.t) + l.side * 52 + (l.tilt ?? 0)
              const flip = l.side === -1 ? -1 : 1
              const k = l.size * (stem.leafScale ?? 1)
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${angle}) scale(${k} ${k * flip})`}>
                  <g style={animated ? {
                    transform: grown ? 'scale(1)' : 'scale(0)', transformOrigin: '0 0',
                    transition: `transform .7s cubic-bezier(.3,1.4,.5,1) ${delay(l.s, l.t)}s`,
                  } : undefined}>
                    <LeafShape tone={l.tone} />
                  </g>
                </g>
              )
            })}
            {stem.berries?.map((b, i) => {
              const [x, y] = at(stem.segs[b.s], b.t)
              return (
                <g key={`b${i}`} transform={`translate(${x + b.dx} ${y + b.dy})`}
                   style={animated ? { opacity: grown ? 1 : 0, transition: `opacity .5s ${delay(b.s, b.t) + 0.3}s` } : undefined}>
                  <circle r={b.r} fill={tokens.amber} stroke={tokens.amberDark} strokeWidth={0.6} />
                  <circle r={b.r * 0.32} cx={-b.r * 0.32} cy={-b.r * 0.35} fill="#FFE3B8" opacity={0.85} />
                </g>
              )
            })}
          </g>
        )
      })}
    </>
  )
}
