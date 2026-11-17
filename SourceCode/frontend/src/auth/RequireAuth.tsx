import type { ReactNode } from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useAuth } from './AuthContext'

function Centered({ children }: { children: ReactNode }) {
  return <Box sx={{ py: 12, textAlign: 'center' }}>{children}</Box>
}

/** Shows the page only to signed-in users; otherwise asks them to sign in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, openSignIn } = useAuth()
  if (loading) return <Centered><CircularProgress /></Centered>
  if (!user) {
    return (
      <Centered>
        <Typography variant="h2" gutterBottom>Please sign in</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Sign in to place orders and follow them step by step.
        </Typography>
        <Button variant="contained" size="large" onClick={openSignIn}>Sign in</Button>
      </Centered>
    )
  }
  return <>{children}</>
}

/** Shows the page only to admins. The back-end checks the role again on every admin request. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, loading, user } = useAuth()
  return (
    <RequireAuth>
      {!loading && user && !isAdmin ? (
        <Centered>
          <Typography variant="h2" gutterBottom>Admins only</Typography>
          <Typography color="text.secondary">This page is for the studio owner.</Typography>
        </Centered>
      ) : children}
    </RequireAuth>
  )
}
