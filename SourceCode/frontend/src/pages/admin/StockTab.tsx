import { useEffect, useState } from 'react'
import { Alert, Box, Button, Chip, Skeleton, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { adminApi, type AdminProduct } from '../../api/admin'
import { errorMessage } from '../../api/client'
import { formatUsd } from '../../api/format'
import { useNotify } from '../../components/Notifier'
import { tokens } from '../../theme/theme'

function StockRow({ product, onChange }: { product: AdminProduct; onChange: (p: AdminProduct) => void }) {
  const notify = useNotify()
  const [value, setValue] = useState(product.stock === null ? '' : String(product.stock))
  const [busy, setBusy] = useState(false)
  const saved = product.stock === null ? '' : String(product.stock)
  const dirty = value !== saved
  const invalid = value !== '' && (!/^\d+$/.test(value) || Number(value) > 99)

  const save = async () => {
    setBusy(true)
    try {
      const updated = await adminApi.updateStock(product.id, value === '' ? null : Number(value))
      onChange(updated)
      notify(`${product.name}: ${updated.stock === null ? 'unlimited' : `${updated.stock} slots`}`)
    } catch (e) {
      notify(errorMessage(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (active: boolean) => {
    setBusy(true)
    try {
      onChange(await adminApi.setActive(product.id, active))
      notify(`${product.name} is ${active ? 'visible' : 'hidden'} in the catalog`)
    } catch (e) {
      notify(errorMessage(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box sx={{
      display: 'grid', alignItems: 'center', gap: 2, py: 1.5, borderBottom: 1, borderColor: 'divider',
      gridTemplateColumns: { xs: '1fr auto', md: 'minmax(0, 2fr) 90px minmax(170px, 1fr) 120px' },
      opacity: product.active ? 1 : 0.6,
    }}>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 600 }}>{product.name}</Typography>
          <Chip size="small" label={product.type === 'PACKAGE' ? 'Package' : 'Add-on'}
                sx={{ bgcolor: product.type === 'PACKAGE' ? tokens.cream : tokens.sand }} />
        </Box>
        <Typography variant="body2" color="text.secondary">/{product.slug}</Typography>
      </Box>
      <Typography sx={{ display: { xs: 'none', md: 'block' } }}>{formatUsd(product.price)}</Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', gridColumn: { xs: '1 / -1', md: 'auto' } }}>
        <TextField size="small" label="Slots" value={value} placeholder="∞"
                   onChange={(e) => setValue(e.target.value.trim())}
                   onKeyDown={(e) => { if (e.key === 'Enter' && dirty && !invalid) void save() }}
                   error={invalid} sx={{ width: 90 }}
                   slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': `Slots for ${product.name}` } }} />
        {dirty && (
          <Button size="small" variant="contained" disabled={busy || invalid} onClick={() => void save()}>Save</Button>
        )}
      </Box>
      <Tooltip title={product.active ? 'Visible in the catalog' : 'Hidden from the catalog'}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, gridColumn: { xs: 2, md: 'auto' }, gridRow: { xs: 1, md: 'auto' } }}>
          <Switch checked={product.active} disabled={busy} onChange={(e) => void toggle(e.target.checked)}
                  slotProps={{ input: { 'aria-label': `Show ${product.name} in catalog` } }} />
          <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
            {product.active ? 'Visible' : 'Hidden'}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  )
}

/** Change open slots per product and hide products from the catalog. */
export function StockTab({ refreshKey }: { refreshKey: number }) {
  const [products, setProducts] = useState<AdminProduct[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi.products().then((p) => { setProducts(p); setError(null) }).catch((e) => setError(errorMessage(e)))
  }, [refreshKey])

  const replace = (p: AdminProduct) => setProducts((list) => list?.map((x) => (x.id === p.id ? p : x)) ?? null)

  return (
    <Box>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Slots = projects you can take this month. Leave the field empty for unlimited. Press Enter or Save.
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!products && !error && Array.from({ length: 6 }, (_, i) => <Skeleton key={i} height={64} />)}
      {products?.map((p) => <StockRow key={`${p.id}-${p.stock}`} product={p} onChange={replace} />)}
    </Box>
  )
}
