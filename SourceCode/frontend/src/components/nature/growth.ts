/** Seeded generator for natural-looking vines: tapering stems, scattered leaves, tendrils, berries. */

export type Pt = readonly [number, number]
export type LeafKind = 'ivy' | 'pothos' | 'long'

/** Greens that sit well on warm paper, from deep shade to sunlit. Repeats weight the mid tones. */
export const greens = ['#2F4A2B', '#3F6035', '#3F6035', '#4F6B3A', '#4F6B3A', '#5A7F3E', '#6F8F4E', '#7C9A4F', '#A3B574', '#8A9A3C']
/** Paler greens for leaves that must read against the dark footer band. */
export const sunlitGreens = ['#5A7F3E', '#6F8F4E', '#7C9A4F', '#7C9A4F', '#A3B574', '#A3B574', '#8A9A3C', '#B7C48A']
/** Dry, fallen-leaf tone. */
export const dryLeaf = '#C8A576'

/* ---------- seeded randomness ---------- */

/** mulberry32: a tiny deterministic PRNG, so each vine looks the same on every render. */
export function rng(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rad = (d: number) => (d * Math.PI) / 180
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Turns angle a toward angle b by k (0..1), the short way round. */
const lerpAngle = (a: number, b: number, k: number) => a + (((b - a + 540) % 360) - 180) * k
export const n1 = (v: number) => Math.round(v * 10) / 10

/** Smooth path through points: quadratic curves between midpoints. */
function smooth(pts: readonly Pt[], move = true): string {
  let d = `${move ? 'M' : 'L'}${n1(pts[0][0])} ${n1(pts[0][1])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i]
    d += ` Q${n1(x)} ${n1(y)} ${n1((x + pts[i + 1][0]) / 2)} ${n1((y + pts[i + 1][1]) / 2)}`
  }
  const last = pts[pts.length - 1]
  return d + ` L${n1(last[0])} ${n1(last[1])}`
}

/* ---------- generator ---------- */

export interface GrowOptions {
  seed: number
  start: Pt
  /** Initial direction in degrees: 90 grows down, -90 grows up, 0 grows right. */
  angle: number
  length: number
  /** Distance between nodes (where leaves sit). */
  step?: number
  /** Random turn per node, in degrees. */
  wander?: number
  /** How strongly the stem returns to its initial direction (0..1). */
  pull?: number
  /** Stem width at the base and at the tip. */
  width?: readonly [number, number]
  /** Chance of a leaf at each node. */
  leafChance?: number
  /** Leaf scale at the base and at the tip. */
  leafSize?: readonly [number, number]
  kinds?: readonly LeafKind[]
  palette?: readonly string[]
  /** Leaves turn toward this direction (degrees) by `bendAmount`: down for hanging vines, up for plants. */
  bendTo?: number
  bendAmount?: number
  tendrilChance?: number
  berryChance?: number
  /** Chance a leaf gently sways. */
  swayChance?: number
  branches?: readonly { at: number; turn: number; length: number }[]
}

export interface Leaf {
  x: number
  y: number
  rot: number
  size: number
  flip: boolean
  kind: LeafKind
  fill: string
  petiole: number
  sway?: { dur: number; delay: number }
}
export interface Tendril { x: number; y: number; rot: number; size: number }
export interface Berry { x: number; y: number; r: number }

export interface Grown {
  /** Filled, tapering stem outline. */
  stem: string
  /** Centre line of the stem, used to reveal the vine when it "grows". */
  spine: string
  /** Where along the whole plant this vine starts (0..1), for grow timing. */
  offset: number
  leaves: Leaf[]
  tendrils: Tendril[]
  berries: Berry[]
  children: Grown[]
}

/** Grows one vine (and its side branches) from a seed. Pure: same options, same vine. */
export function grow(o: GrowOptions, offset = 0): Grown {
  const r = rng(o.seed)
  const step = o.step ?? 14
  const wander = o.wander ?? 16
  const pull = o.pull ?? 0.12
  const [w0, w1] = o.width ?? [3, 0.8]
  const [s0, s1] = o.leafSize ?? [1.1, 0.6]
  const kinds = o.kinds ?? ['ivy', 'ivy', 'pothos', 'long']
  const palette = o.palette ?? greens
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]

  const pts: Pt[] = [o.start]
  let a = o.angle
  let [x, y] = o.start
  const nodes = Math.max(2, Math.round(o.length / step))
  for (let i = 0; i < nodes; i++) {
    a = lerpAngle(a + (r() - 0.5) * wander * 2, o.angle, pull)
    x += Math.cos(rad(a)) * step
    y += Math.sin(rad(a)) * step
    pts.push([x, y])
  }
  const last = pts.length - 1

  const heading = (i: number) => {
    const p = pts[Math.max(0, i - 1)]
    const q = pts[Math.min(last, i + 1)]
    return (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI
  }

  // Tapering outline: offset each point along its normal by half the local width.
  const left: Pt[] = []
  const right: Pt[] = []
  pts.forEach((p, i) => {
    const h = rad(heading(i))
    const w = lerp(w0, w1, i / last) / 2
    const nx = -Math.sin(h) * w
    const ny = Math.cos(h) * w
    left.push([p[0] + nx, p[1] + ny])
    right.push([p[0] - nx, p[1] - ny])
  })
  const stem = `${smooth(left)} ${smooth(right.reverse(), false)} Z`

  const leaves: Leaf[] = []
  const tendrils: Tendril[] = []
  const berries: Berry[] = []
  let side = r() < 0.5 ? 1 : -1
  const addLeaf = (i: number, s: number, scale: number) => {
    let rot = heading(i) + s * (40 + r() * 38)
    if (o.bendTo !== undefined) rot = lerpAngle(rot, o.bendTo, (o.bendAmount ?? 0.35) * (0.5 + r() * 0.6))
    leaves.push({
      x: pts[i][0], y: pts[i][1], rot,
      size: lerp(s0, s1, i / last) * (0.72 + r() * 0.5) * scale,
      flip: s < 0,
      kind: pick(kinds),
      fill: pick(palette),
      petiole: 2 + r() * 3.5,
      sway: r() < (o.swayChance ?? 0.35) ? { dur: 4 + r() * 4, delay: -r() * 7 } : undefined,
    })
  }
  for (let i = 1; i < last; i++) {
    if (r() < (o.leafChance ?? 0.8)) {
      addLeaf(i, side, 1)
      // Now and then a second, smaller leaf on the other side of the same node.
      if (r() < 0.22) addLeaf(i, -side, 0.7)
    }
    // Mostly alternating, sometimes two in a row on one side.
    if (r() < 0.8) side = -side
    if (r() < (o.tendrilChance ?? 0.06)) {
      tendrils.push({ x: pts[i][0], y: pts[i][1], rot: heading(i) - side * 70, size: 0.7 + r() * 0.5 })
    }
    if (r() < (o.berryChance ?? 0)) {
      const h = rad(heading(i) + side * 90)
      const d = 5 + r() * 4
      berries.push({ x: pts[i][0] + Math.cos(h) * d, y: pts[i][1] + Math.sin(h) * d, r: 2.2 + r() * 1.2 })
      if (r() < 0.6) {
        berries.push({ x: pts[i][0] + Math.cos(h) * (d + 4.5), y: pts[i][1] + Math.sin(h) * (d + 4.5) + 2.5, r: 1.8 + r() })
      }
    }
  }
  // Every vine ends in a small tip leaf.
  leaves.push({
    x: pts[last][0], y: pts[last][1], rot: heading(last), size: s1 * 0.8, flip: r() < 0.5,
    kind: 'long', fill: pick(palette), petiole: 0,
  })

  const children = (o.branches ?? []).map((b, k) => {
    const i = Math.max(1, Math.min(last - 1, Math.round(b.at * last)))
    const wHere = lerp(w0, w1, i / last)
    return grow({
      ...o,
      seed: o.seed * 31 + k + 7, start: pts[i], angle: heading(i) + b.turn, length: b.length,
      width: [wHere * 0.75, w1], leafSize: [lerp(s0, s1, b.at) * 0.95, s1], branches: undefined,
      berryChance: (o.berryChance ?? 0) * 0.5,
    }, offset + b.at * (1 - offset))
  })

  return { stem, spine: smooth(pts), offset, leaves, tendrils, berries, children }
}

