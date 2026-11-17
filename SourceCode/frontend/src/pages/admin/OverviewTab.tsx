import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Alert, Box, Button, Paper, Skeleton, Typography } from '@mui/material'
import { adminApi, type AdminSummary } from '../../api/admin'
import { errorMessage } from '../../api/client'
import { formatUsd } from '../../api/format'
import { statusLabel } from '../../api/status'
import type { OrderStatus } from '../../api/types'
import { Bead } from '../../components/Bead'
import { fonts, tokens } from '../../theme/theme'

function Tile({ label, value, hint, action }: { label: string; value: ReactNode; hint?: ReactNode; action?: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 32, lineHeight: 1.1 }}>{value}</Typography>
      {hint && <Box sx={{ color: 'text.secondary', fontSize: 14 }}>{hint}</Box>}
      {action && <Box sx={{ mt: 'auto', pt: 1 }}>{action}</Box>}
    </Paper>
  )
}

const statuses: OrderStatus[] = ['NEW', 'IN_PROGRESS', 'DONE', 'CANCELLED']

/** Mini summary: orders by status, money, open slots, questions waiting. */
export function OverviewTab({ onOpenTab }: { onOpenTab: (tab: string) => void }) {
  const [data, setData] = useState<AdminSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    adminApi.summary().then((d) => { setData(d); setError(null) }).catch((e) => setError(errorMessage(e)))
  }, [])
  useEffect(() => { load() }, [load])

  if (error) {
    return <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>{error}</Alert>
  }
  if (!data) {
    return (
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} variant="rounded" height={130} />)}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
        <Tile label="New orders" value={data.ordersByStatus.NEW}
              hint={`${data.totalOrders} orders in total`}
              action={<Button size="small" onClick={() => onOpenTab('orders')}>Open orders</Button>} />
        <Tile label="Questions waiting" value={data.unansweredQuestions}
              hint={data.unansweredQuestions === 0 ? 'All answered' : 'Clients are waiting for a reply'}
              action={<Button size="small" onClick={() => onOpenTab('questions')}>Answer</Button>} />
        <Tile label="Open slots" value={data.openSlots}
              hint={<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {Array.from({ length: Math.min(data.openSlots, 24) }, (_, i) => <Bead key={i} size={10} />)}
              </Box>}
              action={<Button size="small" onClick={() => onOpenTab('stock')}>Change stock</Button>} />
        <Tile label="Revenue (launched)" value={formatUsd(data.revenue)}
              hint={`${formatUsd(data.pipeline)} more in received and in-progress orders`} />
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Orders by status</Typography>
        <Box sx={{ display: 'grid', gap: 1.25 }}>
          {statuses.map((s) => {
            const count = data.ordersByStatus[s] ?? 0
            const share = data.totalOrders === 0 ? 0 : (count / data.totalOrders) * 100
            return (
              <Box key={s} sx={{ display: 'grid', gridTemplateColumns: '110px 1fr 40px', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">{statusLabel[s]}</Typography>
                <Box sx={{ height: 10, borderRadius: 5, bgcolor: tokens.sand, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${share}%`, bgcolor: s === 'CANCELLED' ? '#CBBBA8' : tokens.amber, borderRadius: 5 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{count}</Typography>
              </Box>
            )
          })}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {data.activeProducts} products are visible in the catalog.
        </Typography>
      </Paper>
    </Box>
  )
}
