import { Container, Typography } from '@mui/material'
import { RequireAuth } from '../auth/RequireAuth'

export function OrdersPage() {
  return (
    <RequireAuth>
      <Container maxWidth="lg" sx={{ pt: 8 }}>
        <Typography variant="h2" gutterBottom>My orders</Typography>
        <Typography color="text.secondary">You have no orders yet.</Typography>
      </Container>
    </RequireAuth>
  )
}
