import { useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router'
import { Avatar, Box, Button, Container, Divider, Link, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import { fonts } from '../theme/theme'
import { Bead } from './Bead'
import { IstanbulClock } from './IstanbulClock'
import { HangingVine } from './nature/decorations'

const navLinks = [
  { label: 'Work', to: '/#work' },
  { label: 'Packages', to: '/#packages' },
  { label: 'My orders', to: '/orders' },
]

function AccountMenu() {
  const { user, me, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const name = me?.displayName || user?.displayName || user?.email || 'Account'
  const go = (to: string) => { setAnchor(null); void navigate(to) }

  return (
    <>
      <Button onClick={(e) => setAnchor(e.currentTarget)} color="inherit" sx={{ px: 1, minWidth: 0 }}
              aria-label="Account menu">
        <Avatar src={user?.photoURL ?? undefined}
                sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'text.primary', fontWeight: 700, fontSize: 15 }}>
          {name.charAt(0).toUpperCase()}
        </Avatar>
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
          <Typography noWrap sx={{ fontWeight: 600 }}>{name}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>{user?.email}</Typography>
        </Box>
        <Divider />
        {navLinks.map((l) => (
          <MenuItem key={l.to} onClick={() => go(l.to)} sx={{ display: { md: 'none' } }}>
            <ListItemText>{l.label}</ListItemText>
          </MenuItem>
        ))}
        <MenuItem onClick={() => go('/orders')} sx={{ display: { xs: 'none', md: 'flex' } }}>My orders</MenuItem>
        {isAdmin && <MenuItem onClick={() => go('/admin')}>Admin panel</MenuItem>}
        <MenuItem onClick={() => { setAnchor(null); void signOut(); void navigate('/') }}>Sign out</MenuItem>
      </Menu>
    </>
  )
}

function GuestMenu() {
  const { openSignIn } = useAuth()
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <Button color="inherit" onClick={(e) => setAnchor(e.currentTarget)} sx={{ display: { md: 'none' } }}>
        Menu
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {navLinks.map((l) => (
          <MenuItem key={l.to} onClick={() => { setAnchor(null); void navigate(l.to) }}>{l.label}</MenuItem>
        ))}
      </Menu>
      <Button variant="contained" color="secondary" onClick={openSignIn}>Sign in</Button>
    </>
  )
}

export function Header() {
  const { user, loading } = useAuth()
  const { packageId } = useCart()
  const { pathname } = useLocation()
  return (
    <Box component="header" sx={{ position: 'relative', borderBottom: 1, borderColor: 'divider' }}>
      {!pathname.startsWith('/admin') && (
        // Hangs into the empty right margin, so it only shows when that margin is wide enough.
        <HangingVine sx={{
          position: 'absolute', top: 0, right: { xs: 4, xl: 28 }, zIndex: 1,
          display: 'none', width: 96, height: 236,
          '@media (min-width: 1400px)': { display: 'block' },
          '@media (min-width: 1520px)': { width: 128, height: 314 },
        }} />
      )}
      <Container maxWidth="lg" sx={{ height: 72, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Link component={RouterLink} to="/" underline="none" color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Bead size={18} />
          <Typography component="span" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em' }}>
            amber
          </Typography>
        </Link>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={3} sx={{ alignItems: 'center', display: { xs: 'none', md: 'flex' } }}>
          <IstanbulClock />
          {navLinks.map((l) => (
            <Link key={l.to} component={RouterLink} to={l.to} color="text.primary" underline="none"
                  sx={{ fontSize: 15, '&:hover': { color: 'primary.dark' } }}>
              {l.label}
            </Link>
          ))}
        </Stack>

        {packageId !== null && (
          <Button component={RouterLink} to="/cart" variant="outlined" color="secondary" size="small"
                  startIcon={<Bead size={10} />}>
            Your order
          </Button>
        )}

        <Box sx={{ minWidth: 90, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {loading ? null : user ? <AccountMenu /> : <GuestMenu />}
        </Box>
      </Container>
    </Box>
  )
}
