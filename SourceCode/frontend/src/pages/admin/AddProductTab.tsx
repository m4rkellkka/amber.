import { useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router'
import {
  Alert, Box, Button, FormControlLabel, InputAdornment, Link, Paper, Switch, TextField, ToggleButton,
  ToggleButtonGroup, Typography,
} from '@mui/material'
import { adminApi, type AdminProduct, type ProductForm } from '../../api/admin'
import { errorMessage, fieldErrors } from '../../api/client'
import type { ProductType } from '../../api/types'
import { useNotify } from '../../components/Notifier'

interface Draft {
  type: ProductType
  name: string
  slug: string
  shortDescription: string
  description: string
  price: string
  deliveryDays: string
  stock: string
  features: string
  allowMultiple: boolean
}

const emptyDraft: Draft = {
  type: 'PACKAGE', name: '', slug: '', shortDescription: '', description: '',
  price: '', deliveryDays: '', stock: '', features: '', allowMultiple: false,
}

const toNumber = (s: string): number | null => (s.trim() === '' ? null : Number(s))

/** Form to add a package or an add-on. Errors from the server appear under each field. */
export function AddProductTab({ onCreated }: { onCreated: () => void }) {
  const notify = useNotify()
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<AdminProduct | null>(null)
  const isPackage = draft.type === 'PACKAGE'

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError(null)
    const form: ProductForm = {
      type: draft.type,
      name: draft.name,
      slug: draft.slug.trim(),
      shortDescription: draft.shortDescription,
      description: draft.description,
      price: toNumber(draft.price),
      deliveryDays: isPackage ? toNumber(draft.deliveryDays) : null,
      stock: toNumber(draft.stock),
      features: draft.features.split('\n').map((f) => f.trim()).filter(Boolean),
      allowMultiple: !isPackage && draft.allowMultiple,
    }
    try {
      const product = await adminApi.createProduct(form)
      setCreated(product)
      setDraft({ ...emptyDraft, type: draft.type })
      notify(`${product.name} added to the catalog`)
      onCreated()
    } catch (err) {
      const fields = fieldErrors(err)
      setErrors(fields)
      if (Object.keys(fields).length === 0) setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof Draft) => ({
    value: draft[key] as string,
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
    error: Boolean(errors[key]),
    helperText: errors[key] || undefined,
    fullWidth: true,
  })

  return (
    <Paper variant="outlined" component="form" onSubmit={(e) => void submit(e)} noValidate
           sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, maxWidth: 760 }}>
      <Typography variant="h3" component="h2" sx={{ mb: 2 }}>Add a product</Typography>

      {created && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCreated(null)}>
          {created.name} is live.{' '}
          {created.type === 'PACKAGE' && (
            <Link component={RouterLink} to={`/packages/${created.slug}`}>Open its page</Link>
          )}
        </Alert>
      )}

      <ToggleButtonGroup exclusive value={draft.type} size="small" sx={{ mb: 3 }}
                         onChange={(_, v: ProductType | null) => v && set('type', v)}>
        <ToggleButton value="PACKAGE" sx={{ px: 2 }}>Package</ToggleButton>
        <ToggleButton value="ADDON" sx={{ px: 2 }}>Add-on</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <TextField label="Name" required {...field('name')} />
        <TextField label="Page address (optional)" placeholder="made from the name" {...field('slug')}
                   helperText={errors.slug || 'Lowercase letters, numbers and dashes'} />
        <TextField label="Short description" required {...field('shortDescription')}
                   helperText={errors.shortDescription || 'One line for the catalog, up to 160 characters'}
                   sx={{ gridColumn: '1 / -1' }} />
        <TextField label="Price" required type="number" {...field('price')}
                   slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />
        {isPackage ? (
          <TextField label="Delivery time" required type="number" {...field('deliveryDays')}
                     slotProps={{ input: { endAdornment: <InputAdornment position="end">days</InputAdornment> } }} />
        ) : (
          <FormControlLabel
            control={<Switch checked={draft.allowMultiple} onChange={(e) => set('allowMultiple', e.target.checked)} />}
            label="Client can order more than one" />
        )}
        <TextField label="Slots this month" type="number" {...field('stock')}
                   helperText={errors.stock || 'Leave empty for unlimited'} />
        {isPackage && (
          <TextField label="Description" multiline minRows={3} {...field('description')} sx={{ gridColumn: '1 / -1' }} />
        )}
        {isPackage && (
          <TextField label="What the client gets" multiline minRows={4} {...field('features')}
                     helperText={errors.features || 'One feature per line'} sx={{ gridColumn: '1 / -1' }} />
        )}
      </Box>

      {formError && <Alert severity="error" sx={{ mt: 2.5 }}>{formError}</Alert>}
      <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
        <Button type="submit" variant="contained" size="large" disabled={saving}>
          {saving ? 'Saving…' : `Add ${isPackage ? 'package' : 'add-on'}`}
        </Button>
        <Button color="secondary" onClick={() => { setDraft({ ...emptyDraft, type: draft.type }); setErrors({}) }}>
          Clear
        </Button>
      </Box>
    </Paper>
  )
}
