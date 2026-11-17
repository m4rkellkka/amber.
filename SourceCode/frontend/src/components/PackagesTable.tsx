import { Link as RouterLink } from 'react-router'
import { Alert, Box, Button, Skeleton, Typography } from '@mui/material'
import { currentMonth, formatUsd } from '../api/format'
import type { Product } from '../api/types'
import { fonts, tokens } from '../theme/theme'
import { BeadRow } from './BeadRow'

interface Props {
  packages: Product[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

const columns = { md: '1.4fr 2.2fr 0.7fr 1.1fr 0.6fr' }

/** The packages list: each row opens the package page. */
export function PackagesTable({ packages, loading, error, onRetry }: Props) {
  return (
    <Box component="section" id="packages" sx={{ scrollMarginTop: 24 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h2">Packages</Typography>
        <Typography variant="body2" color="text.secondary">USD · open slots for {currentMonth()}</Typography>
      </Box>

      {error && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>Retry</Button>}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderTop: `1px solid ${tokens.ink}` }}>
        {loading && Array.from({ length: 5 }, (_, i) => (
          <Box key={i} sx={{ py: 2.5, borderBottom: 1, borderColor: 'divider' }}><Skeleton height={28} /></Box>
        ))}
        {!loading && packages.map((p) => (
          <Box key={p.id} component={RouterLink} to={`/packages/${p.slug}`}
               sx={{
                 display: 'grid', alignItems: 'center', gap: { xs: 0.5, md: 2 },
                 gridTemplateColumns: { xs: '1fr auto', ...columns },
                 py: 2.5, px: { md: 1 }, borderBottom: 1, borderColor: 'divider',
                 color: 'inherit', textDecoration: 'none', transition: 'background-color .15s',
                 '&:hover': { bgcolor: tokens.cream },
                 '&:focus-visible': { outline: `2px solid ${tokens.amber}`, outlineOffset: 2 },
               }}>
            <Typography sx={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 19, letterSpacing: '-0.01em' }}>
              {p.name}
            </Typography>
            <Typography variant="body2" color="text.secondary"
                        sx={{ gridColumn: { xs: '1 / -1', md: 'auto' }, gridRow: { xs: 2, md: 'auto' } }}>
              {p.shortDescription}
            </Typography>
            <Typography variant="body2" color="text.secondary"
                        sx={{ display: { xs: 'none', md: 'block' } }}>
              {p.deliveryDays} days
            </Typography>
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' }, gridRow: { xs: 3, md: 'auto' }, mt: { xs: 0.5, md: 0 } }}>
              <BeadRow stock={p.stock} />
            </Box>
            <Typography sx={{
              fontFamily: fonts.display, fontWeight: 700, fontSize: 20, textAlign: 'right',
              gridColumn: { xs: 2, md: 'auto' }, gridRow: { xs: 1, md: 'auto' },
            }}>
              {formatUsd(p.price)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
