import { useCallback, useEffect, useState } from 'react'
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Paper,
  Select, Skeleton, Typography,
} from '@mui/material'
import { adminApi, type AdminOrder } from '../../api/admin'
import { errorMessage } from '../../api/client'
import { formatDate, formatUsd } from '../../api/format'
import { statusLabel } from '../../api/status'
import type { OrderStatus } from '../../api/types'
import { useNotify } from '../../components/Notifier'
import { fonts, tokens } from '../../theme/theme'

const statuses: OrderStatus[] = ['NEW', 'IN_PROGRESS', 'DONE', 'CANCELLED']

function OrderRow({ row, onStatus }: { row: AdminOrder; onStatus: (row: AdminOrder, s: OrderStatus) => void }) {
  const { order } = row
  const [pkg, ...addons] = order.items
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, opacity: order.status === 'CANCELLED' ? 0.65 : 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            #{order.id} · {formatDate(order.createdAt)} · {row.customerName ?? 'No name'} ({row.customerEmail})
          </Typography>
          <Typography variant="h4" component="h3" sx={{ mt: 0.5 }}>{pkg?.productName}</Typography>
          {addons.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              + {addons.map((a) => (a.quantity > 1 ? `${a.productName} × ${a.quantity}` : a.productName)).join(', ')}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 22 }}>{formatUsd(order.totalPrice)}</Typography>
          <Select size="small" value={order.status} disabled={order.status === 'CANCELLED'}
                  onChange={(e) => onStatus(row, e.target.value as OrderStatus)}
                  inputProps={{ 'aria-label': `Status of order ${order.id}` }} sx={{ minWidth: 150 }}>
            {statuses.map((s) => <MenuItem key={s} value={s}>{statusLabel[s]}</MenuItem>)}
          </Select>
        </Box>
      </Box>
      {order.brief && (
        <Typography variant="body2" sx={{ mt: 1.5, p: 1.5, bgcolor: tokens.sand, borderRadius: 2, whiteSpace: 'pre-line' }}>
          {order.brief}
        </Typography>
      )}
    </Paper>
  )
}

/** All orders, newest first; the admin moves them along or cancels them. */
export function OrdersTab({ onChanged }: { onChanged: () => void }) {
  const notify = useNotify()
  const [rows, setRows] = useState<AdminOrder[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<AdminOrder | null>(null)

  const load = useCallback(() => {
    adminApi.orders().then((r) => { setRows(r); setError(null) }).catch((e) => setError(errorMessage(e)))
  }, [])
  useEffect(() => { load() }, [load])

  const apply = async (row: AdminOrder, status: OrderStatus) => {
    try {
      const updated = await adminApi.changeStatus(row.order.id, status)
      setRows((list) => list?.map((r) => (r.order.id === updated.order.id ? updated : r)) ?? null)
      notify(`Order #${row.order.id}: ${statusLabel[status]}${status === 'CANCELLED' ? ', slot returned' : ''}`)
      onChanged()
    } catch (e) {
      notify(errorMessage(e), 'error')
    }
  }

  const onStatus = (row: AdminOrder, status: OrderStatus) => {
    if (status === 'CANCELLED') setConfirm(row)
    else void apply(row, status)
  }

  return (
    <Box>
      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>{error}</Alert>}
      {!rows && !error && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} variant="rounded" height={110} sx={{ mb: 2 }} />)}
      {rows?.length === 0 && <Typography color="text.secondary">No orders yet.</Typography>}
      <Box sx={{ display: 'grid', gap: 2 }}>
        {rows?.map((r) => <OrderRow key={r.order.id} row={r} onStatus={onStatus} />)}
      </Box>

      <Dialog open={confirm !== null} onClose={() => setConfirm(null)}>
        <DialogTitle>Cancel order #{confirm?.order.id}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The slot for {confirm?.order.items[0]?.productName} goes back to the catalog.
            A cancelled order cannot be reopened.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={() => setConfirm(null)}>Keep order</Button>
          <Button color="error" variant="contained"
                  onClick={() => { if (confirm) void apply(confirm, 'CANCELLED'); setConfirm(null) }}>
            Cancel order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
