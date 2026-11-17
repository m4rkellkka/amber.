import { Container, Typography } from '@mui/material'
import { RequireAdmin } from '../auth/RequireAuth'
import { useAuth } from '../auth/AuthContext'

export function AdminPage() {
  const { me } = useAuth()
  return (
    <RequireAdmin>
      <Container maxWidth="lg" sx={{ pt: 8 }}>
        <Typography variant="h2" gutterBottom>Admin panel</Typography>
        <Typography color="text.secondary">Signed in as {me?.email}.</Typography>
      </Container>
    </RequireAdmin>
  )
}
