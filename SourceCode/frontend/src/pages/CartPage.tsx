import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { isAxiosError } from 'axios'
import {
  Alert, Box, Button, Checkbox, Container, Divider, IconButton, Link, Paper, Skeleton, TextField, Typography,
} from '@mui/material'
import { errorMessage } from '../api/client'
import { formatUsd } from '../api/format'
import { placeOrder } from '../api/orders'
import type { Product } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import { BeadRow } from '../components/BeadRow'
import { useCatalog } from '../hooks/useCatalog'
import { usePageTitle } from '../hooks/usePageTitle'
import { fonts, tokens } from '../theme/theme'

const BRIEF_LIMIT = 4000

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <IconButton size="small" aria-label={`Fewer ${label}`} onClick={() => onChange(value - 1)}>−</IconButton>
      <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }} aria-live="polite">{value}</Typography>
      <IconButton size="small" aria-label={`More ${label}`} disabled={value >= 20} onClick={() => onChange(value + 1)}>+</IconButton>
    </Box>
  )
}

function AddonRow({ addon, quantity, onChange }: { addon: Product; quantity: number; onChange: (q: number) => void }) {
  const checked = quantity > 0
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked ? 1 : 0)}
                slotProps={{ input: { 'aria-label': addon.name } }} sx={{ ml: -1 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }}>{addon.name}</Typography>
        <Typography variant="body2" color="text.secondary">{addon.shortDescription}</Typography>
      </Box>
      {addon.allowMultiple && checked && <Stepper value={quantity} onChange={onChange} label={addon.name} />}
      <Typography sx={{ fontWeight: 600, minWidth: 56, textAlign: 'right', whiteSpace: 'nowrap' }}>
        {formatUsd(addon.price)}
        {addon.allowMultiple && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', fontWeight: 400 }}>
            each
          </Typography>
        )}
      </Typography>
    </Box>
  )
}

/** Step 2: package + add-ons + brief -> place the order. */
export function CartPage() {
  const cart = useCart()
  const { user, openSignIn } = useAuth()
  const navigate = useNavigate()
  const { packages, addons, loading, error: loadError, reload } = useCatalog()
  const [submitting, setSubmitting] = useState(false)
  usePageTitle('Your order')
  const [error, setError] = useState<string | null>(null)

  const pkg = packages.find((p) => p.id === cart.packageId) ?? null
  const chosenAddons = addons.filter((a) => (cart.addons[a.id] ?? 0) > 0)
  const total = (pkg?.price ?? 0) + chosenAddons.reduce((sum, a) => sum + a.price * cart.addons[a.id], 0)
  const soldOut = pkg !== null && pkg.stock !== null && pkg.stock <= 0

  if (!loading && !pkg) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h2" gutterBottom>Pick a package first</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Your order starts with one package. Then you can add extras and describe your project.
        </Typography>
        <Button component={RouterLink} to="/#packages" variant="contained" size="large">See packages</Button>
      </Container>
    )
  }

  const submit = async () => {
    if (!pkg) return
    if (!user) {
      openSignIn()
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const order = await placeOrder({
        items: [
          { productId: pkg.id, quantity: 1 },
          ...chosenAddons.map((a) => ({ productId: a.id, quantity: cart.addons[a.id] })),
        ],
        brief: cart.brief.trim(),
      })
      cart.clear()
      void navigate('/orders', { state: { placedOrderId: order.id } })
    } catch (e) {
      setError(errorMessage(e))
      if (isAxiosError(e) && e.response?.status === 409) reload() // show the real number of slots
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: 4 }}>Your order</Typography>
      {loadError && <Alert severity="error" sx={{ mb: 3 }}>{loadError}</Alert>}

      <Box sx={{
        display: 'grid', gap: { xs: 4, md: 6 }, alignItems: 'start',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 340px' },
      }}>
        <Box>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            {loading || !pkg ? <Skeleton height={64} /> : (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">Package</Typography>
                  <Typography variant="h3" component="p" sx={{ my: 0.5 }}>{pkg.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {pkg.shortDescription} · {pkg.deliveryDays} days
                  </Typography>
                  <BeadRow stock={pkg.stock} />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 22 }}>{formatUsd(pkg.price)}</Typography>
                  <Link component={RouterLink} to="/#packages" sx={{ color: tokens.link, fontSize: 14 }}>Change</Link>
                </Box>
              </Box>
            )}
          </Paper>
          {soldOut && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This package is fully booked for this month. Please choose another one.
            </Alert>
          )}

          <Typography variant="h4" sx={{ mt: 5, mb: 1 }}>Add-ons</Typography>
          <Box>
            {loading
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={56} />)
              : addons.map((a) => (
                <AddonRow key={a.id} addon={a} quantity={cart.addons[a.id] ?? 0}
                          onChange={(q) => cart.setAddon(a.id, Math.max(0, Math.min(q, a.allowMultiple ? 20 : 1)))} />
              ))}
          </Box>

          <Typography variant="h4" sx={{ mt: 5, mb: 1.5 }}>Your brief</Typography>
          <TextField
            multiline minRows={5} fullWidth value={cart.brief}
            onChange={(e) => cart.setBrief(e.target.value.slice(0, BRIEF_LIMIT))}
            placeholder="What should I build? Your business, links to sites you like, languages, deadline…"
            helperText={`${cart.brief.length} / ${BRIEF_LIMIT}`}
          />
        </Box>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: tokens.cream, position: { md: 'sticky' }, top: { md: 24 } }}>
          <Typography variant="h4" sx={{ mb: 2 }}>Summary</Typography>
          {pkg && (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Line label={pkg.name} value={pkg.price} />
              {chosenAddons.map((a) => (
                <Line key={a.id} label={cart.addons[a.id] > 1 ? `${a.name} × ${cart.addons[a.id]}` : a.name}
                      value={a.price * cart.addons[a.id]} />
              ))}
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2.5 }}>
            <Typography sx={{ fontWeight: 600 }}>Total</Typography>
            <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 28 }}>{formatUsd(total)}</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button variant="contained" size="large" fullWidth onClick={() => void submit()}
                  disabled={!pkg || soldOut || submitting}>
            {submitting ? 'Placing order…' : user ? 'Place order' : 'Sign in to place order'}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            No payment now. I will read your brief and confirm the details first.
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatUsd(value)}</Typography>
    </Box>
  )
}
