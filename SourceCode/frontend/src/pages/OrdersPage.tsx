import { useLocation } from 'react-router'
import { Alert, Container, Typography } from '@mui/material'
import { RequireAuth } from '../auth/RequireAuth'

export function OrdersPage() {
  const placedOrderId = (useLocation().state as { placedOrderId?: number } | null)?.placedOrderId
  return (
    <RequireAuth>
      <Container maxWidth="lg" sx={{ pt: 8 }}>
        <Typography variant="h2" gutterBottom>My orders</Typography>
        {placedOrderId && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Thank you! Order #{placedOrderId} is placed. You can follow its status here.
          </Alert>
        )}
        <Typography color="text.secondary">Your order history will appear here.</Typography>
      </Container>
    </RequireAuth>
  )
}
