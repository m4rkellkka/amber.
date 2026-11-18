import { Box } from '@mui/material'
import { tokens } from '../theme/theme'

/** Three slightly uneven outlines, so a row of beads looks painted by hand, not stamped. */
const blobs = [
  'M0 -8.6 C5 -8.8 8.7 -4.6 8.5 0.4 C8.3 5.2 4.6 8.7 -0.3 8.5 C-5.2 8.3 -8.6 4.8 -8.4 -0.2 C-8.2 -5.1 -4.9 -8.4 0 -8.6 Z',
  'M0.4 -8.3 C5.3 -8.1 8.6 -4.2 8.3 0.6 C8 5.5 4.2 8.8 -0.6 8.4 C-5.4 8 -8.7 4.3 -8.5 -0.5 C-8.2 -5.2 -4.6 -8.5 0.4 -8.3 Z',
  'M-0.2 -8.5 C4.8 -8.6 8.2 -5 8.6 -0.1 C8.9 4.9 5 8.4 0.1 8.6 C-4.9 8.7 -8.3 5.1 -8.6 0.2 C-8.8 -4.6 -5.1 -8.4 -0.2 -8.5 Z',
]

/**
 * The amber bead: the brand mark and the "one bead = one open slot" counter.
 * `variant` (e.g. the bead's index in a row) picks the outline and turn, so neighbours differ.
 */
export function Bead({ size = 16, empty = false, variant = 0 }: { size?: number; empty?: boolean; variant?: number }) {
  const blob = blobs[variant % blobs.length]
  const turn = ((variant * 47) % 360) - 180
  return (
    <Box component="svg" viewBox="-10 -10 20 20" aria-hidden="true" focusable="false"
         sx={{ display: 'inline-block', flexShrink: 0, width: size, height: size, overflow: 'visible', verticalAlign: 'middle' }}>
      <g transform={`rotate(${turn})`}>
        {empty ? (
          <path d={blob} fill="none" stroke="#D9CBB5" strokeWidth={1.4} />
        ) : (
          <>
            <path d={blob} fill={tokens.amber} stroke={tokens.amberDark} strokeWidth={0.8} />
            {/* shade on one side and a soft dab of light on the other, like a gouache dot */}
            <path d="M8 1 C7 6 2.5 8.4 -2.5 7.6 C2.5 6.2 6 3.6 8 1 Z" fill={tokens.amberDark} opacity={0.35} />
          </>
        )}
      </g>
      {!empty && <ellipse cx={-2.8} cy={-3.2} rx={2.6} ry={1.7} transform="rotate(-35 -2.8 -3.2)" fill="#FFE2B5" opacity={0.75} />}
    </Box>
  )
}
