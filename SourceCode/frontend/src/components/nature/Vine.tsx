import { useId, type CSSProperties } from 'react'
import { tokens } from '../../theme/theme'
import type { Berry, Grown, Leaf, LeafKind, Tendril } from './growth'
import { n1 } from './growth'

/* ---------- leaf shapes ---------- */

/**
 * Leaf outlines, base at (0,0), pointing along +x. `light` is the upper half, painted a bit lighter
 * so the leaf has a sunny side; `veins` is drawn as thin pale strokes.
 */
const shapes: Record<LeafKind, { body: string; light: string; veins: string }> = {
  ivy: {
    body: 'M0 0 C-1 -4 0 -9 5 -10.5 C9 -11.5 12 -9 13 -7 C16 -8 20 -4.5 24 0 C20 4.2 16 7.4 13 6.8 C12 9 9 11 5 10 C0 8.8 -1 4 0 0 Z',
    light: 'M0 0 C-1 -4 0 -9 5 -10.5 C9 -11.5 12 -9 13 -7 C16 -8 20 -4.5 24 0 Z',
    veins: 'M0.6 0 Q12 -0.6 22.5 0 M1 0 Q3.6 -4 5.6 -8.6 M1 0 Q3.6 4 5.6 8.4 M8 -0.3 Q11 -3 13.4 -5.6 M8 0.3 Q11 3 13.2 5.4',
  },
  pothos: {
    body: 'M0 0 C2.5 -8 13 -12 26 -0.5 C14 10 3 8.5 0 0 Z',
    light: 'M0 0 C2.5 -8 13 -12 26 -0.5 Z',
    veins: 'M0.6 0 Q13 -1.6 25 -0.5 M7 -0.6 Q10 -4 12 -7.5 M13 -0.9 Q16 -3.8 18.5 -5.8 M7 -0.4 Q10 3 12 6 M13 -0.7 Q16 2.4 18.5 4.2',
  },
  long: {
    body: 'M0 0 C7 -5 18 -5.5 30 -0.5 C18 4 7 4.5 0 0 Z',
    light: 'M0 0 C7 -5 18 -5.5 30 -0.5 Z',
    veins: 'M0.6 0 Q15 -1.2 29 -0.5 M9 -0.5 Q12 -2 14 -3.4 M17 -0.7 Q20 -2 22 -2.8',
  },
}

const stemColor = '#46612F'

/* ---------- drawing ---------- */

/** One leaf, base at (0,0), pointing along +x. */
export function LeafShape({ kind = 'pothos', fill = tokens.moss }: { kind?: LeafKind; fill?: string }) {
  const s = shapes[kind]
  return (
    <>
      <path d={s.body} fill={fill} stroke="rgba(30, 42, 20, 0.28)" strokeWidth={0.5} />
      <path d={s.light} fill="#FFF8DA" opacity={0.14} />
      <path d={s.veins} fill="none" stroke="rgba(240, 238, 214, 0.42)" strokeWidth={0.6} strokeLinecap="round" />
    </>
  )
}

function Tendrils({ items }: { items: Tendril[] }) {
  return items.map((t, i) => (
    <path key={i} d="M0 0 C6 -1 11 2 10.5 7 C10 11 5.5 11.5 4 9 C3 7 5 5.4 6.6 6.4"
          transform={`translate(${n1(t.x)} ${n1(t.y)}) rotate(${n1(t.rot)}) scale(${n1(t.size)})`}
          fill="none" stroke={stemColor} strokeWidth={0.8 / t.size} strokeLinecap="round" />
  ))
}

function Leaves({ items }: { items: Leaf[] }) {
  return items.map((l, i) => (
    <g key={i} transform={`translate(${n1(l.x)} ${n1(l.y)}) rotate(${n1(l.rot)}) scale(${n1(l.size)} ${n1(l.flip ? -l.size : l.size)})`}>
      <g className={l.sway ? 'amber-leaf' : undefined}
         style={l.sway ? { '--sway': `${n1(l.sway.dur)}s`, '--sway-delay': `${n1(l.sway.delay)}s` } as CSSProperties : undefined}>
        {l.petiole > 0 && <path d={`M0 0 L${n1(l.petiole + 0.5)} 0`} stroke={stemColor} strokeWidth={0.9} strokeLinecap="round" />}
        <g transform={l.petiole > 0 ? `translate(${n1(l.petiole)} 0)` : undefined}>
          <LeafShape kind={l.kind} fill={l.fill} />
        </g>
      </g>
    </g>
  ))
}

function Berries({ items }: { items: Berry[] }) {
  return items.map((b, i) => (
    <g key={i} transform={`translate(${n1(b.x)} ${n1(b.y)})`}>
      <circle r={b.r} fill={tokens.amber} stroke={tokens.amberDark} strokeWidth={0.5} />
      <circle r={b.r * 0.3} cx={-b.r * 0.3} cy={-b.r * 0.32} fill="#FFE3B8" opacity={0.6} />
    </g>
  ))
}

function flatten(v: Grown, out: Grown[] = []): Grown[] {
  out.push(v)
  v.children.forEach((c) => flatten(c, out))
  return out
}

interface VineProps {
  vines: readonly Grown[]
  /**
   * undefined: drawn as is. false/true: hidden/revealed along the stem,
   * which lets a parent "grow" the vine when it scrolls into view.
   */
  grown?: boolean
  /** Seconds the grow animation takes. */
  growTime?: number
}

/** Renders grown vines inside an <svg>: all stems first, then leaves on top. */
export function Vine({ vines, grown, growTime = 2.2 }: VineProps) {
  const maskId = useId()
  const all = vines.flatMap((v) => flatten(v))
  const art = (
    <>
      {all.map((v, i) => <path key={`s${i}`} d={v.stem} fill={stemColor} />)}
      {all.map((v, i) => <Tendrils key={`t${i}`} items={v.tendrils} />)}
      {all.map((v, i) => <Leaves key={`l${i}`} items={v.leaves} />)}
      {all.map((v, i) => <Berries key={`b${i}`} items={v.berries} />)}
    </>
  )
  if (grown === undefined) return art

  // A wide stroke along each stem, drawn in over time, uncovers the stem and the leaves next to it.
  return (
    <>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={6000}>
          {all.map((v, i) => (
            <path key={i} d={v.spine} fill="none" stroke="#fff" strokeWidth={80} pathLength={1}
                  style={{
                    strokeDasharray: 1, strokeDashoffset: grown ? 0 : 1,
                    transition: `stroke-dashoffset ${n1(growTime * (1 - v.offset))}s cubic-bezier(.45,.05,.35,1) ${n1(growTime * v.offset)}s`,
                  }} />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>{art}</g>
    </>
  )
}
