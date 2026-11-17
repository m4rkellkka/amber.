import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router'
import { Alert, Box, Button, Container, Divider, Paper, Skeleton, Typography } from '@mui/material'
import { errorMessage } from '../api/client'
import { formatDate, formatUsd } from '../api/format'
import { fetchMyOrders } from '../api/orders'
import type { Order } from '../api/types'
import { RequireAuth } from '../auth/RequireAuth'
import { OrderStatus } from '../components/OrderStatus'
import { usePageTitle } from '../hooks/usePageTitle'
import { fonts, tokens } from '../theme/theme'

function OrderCard({ order, highlight }: { order: Order; highlight: boolean }) {
  return (
    <Paper variant="outlined" sx={{
      p: { xs: 2.5, md: 3 }, borderRadius: 3,
      borderColor: highlight ? tokens.amber : undefined,
      boxShadow: highlight ? `0 0 0 3px ${tokens.cream}` : 'none',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Order #{order.id} · {formatDate(order.createdAt)}
          </Typography>
          <Typography variant="h3" component="h2" sx={{ mt: 0.5 }}>{order.items[0]?.productName}</Typography>
        </Box>
        <OrderStatus status={order.status} />
      </Box>

      <Box sx={{ mt: 2, display: 'grid', gap: 0.75 }}>
        {order.items.map((item) => (
          <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2" color={item.type === 'PACKAGE' ? 'text.primary' : 'text.secondary'}>
              {item.type === 'ADDON' && '+ '}{item.productName}{item.quantity > 1 && ` × ${item.quantity}`}
            </Typography>
            <Typography variant="body2">{formatUsd(item.lineTotal)}</Typography>
          </Box>
        ))}
      </Box>

      {order.brief && (
        <Typography variant="body2" color="text.secondary"
                    sx={{ mt: 2, p: 1.5, bgcolor: tokens.cream, borderRadius: 2, whiteSpace: 'pre-line' }}>
          {order.brief}
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography sx={{ fontWeight: 600 }}>Total</Typography>
        <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 22 }}>{formatUsd(order.totalPrice)}</Typography>
      </Box>
    </Paper>
  )
}

function OrdersList() {
  const placedOrderId = (useLocation().state as { placedOrderId?: number } | null)?.placedOrderId
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetchMyOrders()
      .then((data) => { setOrders(data); setError(null) })
      .catch((e) => setError(errorMessage(e, 'Could not load your orders.')))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: 1 }}>My orders</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Every order moves from Received to In progress to Launched.
      </Typography>

      {placedOrderId && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Thank you! Order #{placedOrderId} is placed. I will read your brief and get back to you.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {orders === null && !error && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {[0, 1].map((i) => <Skeleton key={i} variant="rounded" height={180} />)}
        </Box>
      )}

      {orders?.length === 0 && (
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 3, textAlign: 'center', bgcolor: tokens.cream }}>
          <Typography variant="h3" component="p" gutterBottom>No orders yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Pick a package, add what you need, and your order will show up here.
          </Typography>
          <Button component={RouterLink} to="/#packages" variant="contained" size="large">See packages</Button>
        </Paper>
      )}

      {orders && orders.length > 0 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {orders.map((o) => <OrderCard key={o.id} order={o} highlight={o.id === placedOrderId} />)}
        </Box>
      )}
    </Container>
  )
}

/** Purchase history of the signed-in user. */
export function OrdersPage() {
  usePageTitle('My orders')
  return <RequireAuth><OrdersList /></RequireAuth>
}
