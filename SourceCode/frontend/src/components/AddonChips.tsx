import { Box, Typography } from '@mui/material'
import { formatUsd } from '../api/format'
import type { Product } from '../api/types'
import { tokens } from '../theme/theme'

export function AddonChips({ addons, title = 'Add to any package' }: { addons: Product[]; title?: string }) {
  if (addons.length === 0) return null
  return (
    <Box component="section">
      <Typography variant="h4" sx={{ mb: 2 }}>{title}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {addons.map((a) => (
          <Box key={a.id} title={a.shortDescription}
               sx={{ px: 1.5, py: 0.75, border: 1, borderColor: 'divider', borderRadius: 2, fontSize: 14 }}>
            {a.name} <Box component="span" sx={{ color: tokens.link, fontWeight: 600 }}>{formatUsd(a.price)}</Box>
          </Box>
        ))}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        You can add these when you place an order.
      </Typography>
    </Box>
  )
}
