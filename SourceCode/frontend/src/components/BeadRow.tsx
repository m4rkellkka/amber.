import { Box, Typography } from '@mui/material'
import { Bead } from './Bead'

/** "● ● ● ● 4 open": one bead per open slot. */
export function BeadRow({ stock, size = 10 }: { stock: number | null; size?: number }) {
  if (stock === null) {
    return <Typography variant="body2" color="text.secondary">Open</Typography>
  }
  if (stock <= 0) {
    return <Typography variant="body2" color="text.secondary">Fully booked</Typography>
  }
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
         aria-label={`${stock} ${stock === 1 ? 'slot' : 'slots'} open`}>
      {Array.from({ length: Math.min(stock, 8) }, (_, i) => <Bead key={i} size={size} />)}
      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.75, whiteSpace: 'nowrap' }}>
        {stock} open
      </Typography>
    </Box>
  )
}
