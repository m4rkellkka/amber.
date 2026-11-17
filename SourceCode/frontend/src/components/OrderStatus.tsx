import { Box, Typography } from '@mui/material'
import type { OrderStatus as Status } from '../api/types'
import { statusLabel } from '../api/status'
import { Bead } from './Bead'

const steps: { status: Status; label: string }[] = [
  { status: 'NEW', label: 'Received' },
  { status: 'IN_PROGRESS', label: 'In progress' },
  { status: 'DONE', label: 'Launched' },
]

/** Progress from brief to launch: filled beads = steps done. */
export function OrderStatus({ status }: { status: Status }) {
  if (status === 'CANCELLED') {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Bead size={12} empty />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Cancelled</Typography>
      </Box>
    )
  }
  const reached = steps.findIndex((s) => s.status === status)
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
         aria-label={`Status: ${statusLabel[status]}, step ${reached + 1} of ${steps.length}`}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        {steps.map((s, i) => <Bead key={s.status} size={12} empty={i > reached} />)}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{statusLabel[status]}</Typography>
    </Box>
  )
}
