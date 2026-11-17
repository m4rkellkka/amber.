import { Box } from '@mui/material'

/** The amber bead: the brand mark and the "one bead = one open slot" counter. */
export function Bead({ size = 16, empty = false }: { size?: number; empty?: boolean }) {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        display: 'inline-block',
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        background: empty
          ? 'transparent'
          : 'radial-gradient(circle at 35% 30%, #FFE3B8 0%, #F7A440 35%, #D9720F 75%, #B85A08 100%)',
        border: empty ? '1.5px solid #E3D6C4' : 'none',
        boxShadow: empty ? 'none' : '0 1px 2px rgba(120, 60, 0, 0.25)',
      }}
    />
  )
}
