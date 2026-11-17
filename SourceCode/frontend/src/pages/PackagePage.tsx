import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import { Alert, Box, Button, Container, Link, Paper, Skeleton, Typography } from '@mui/material'
import { fetchProduct } from '../api/catalog'
import { errorMessage } from '../api/client'
import { formatUsd } from '../api/format'
import type { Product } from '../api/types'
import { useCart } from '../cart/CartContext'
import { BeadRow } from '../components/BeadRow'
import { LeafBullet, LeafSprig } from '../components/nature/decorations'
import { QuestionsSection } from '../components/QuestionsSection'
import { fonts, tokens } from '../theme/theme'
import { usePageTitle } from '../hooks/usePageTitle'
import { NotFoundPage } from './NotFoundPage'

interface LoadError {
  status?: number
  message: string
}

export function PackagePage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { choosePackage } = useCart()
  // Result is stored together with its slug, so a new slug shows the loading state right away.
  const [loaded, setLoaded] = useState<{ slug: string; product?: Product; error?: LoadError } | null>(null)
  const current = loaded?.slug === slug ? loaded : null
  const product = current?.product ?? null
  const error = current?.error ?? null
  usePageTitle(product?.name ?? 'Package')

  useEffect(() => {
    let cancelled = false
    fetchProduct(slug)
      .then((p) => { if (!cancelled) setLoaded({ slug, product: p }) })
      .catch((e: { response?: { status?: number } }) => {
        if (!cancelled) setLoaded({ slug, error: { status: e.response?.status, message: errorMessage(e) } })
      })
    return () => { cancelled = true }
  }, [slug])

  if (error?.status === 404 || (product && product.type !== 'PACKAGE')) return <NotFoundPage />

  const soldOut = product?.stock !== null && product?.stock !== undefined && product.stock <= 0

  const order = () => {
    if (!product) return
    choosePackage(product.id)
    void navigate('/cart')
  }

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
      <Link component={RouterLink} to="/#packages" sx={{ color: tokens.link, fontSize: 15 }}>← All packages</Link>
      {error && <Alert severity="error" sx={{ mt: 3 }}>{error.message}</Alert>}

      <Box sx={{
        mt: 3, display: 'grid', gap: { xs: 4, md: 8 }, alignItems: 'start',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' },
      }}>
        <Box>
          <Typography variant="h1" sx={{ mb: 2 }}>{product ? product.name : <Skeleton width="60%" />}</Typography>
          <Typography sx={{ fontSize: 20, mb: 3 }}>
            {product ? product.shortDescription : <Skeleton />}
          </Typography>
          {product?.description && (
            <Typography color="text.secondary" sx={{ maxWidth: 620, mb: 5 }}>{product.description}</Typography>
          )}

          <Typography variant="h4" sx={{ mb: 2 }}>What you get</Typography>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1.5 }}>
            {(product?.features ?? Array.from({ length: 4 }, () => null)).map((f, i) => (
              <Box component="li" key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <LeafBullet size={15} />
                <Typography>{f ?? <Skeleton width={260} />}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ position: { xs: 'relative', md: 'sticky' }, top: { md: 24 } }}>
        <LeafSprig size={70} sx={{ position: 'absolute', top: -40, left: { xs: -4, md: -26 }, transform: 'scaleX(-1) rotate(6deg)' }} />
        <Paper variant="outlined" sx={{ position: 'relative', p: 3, borderRadius: 3, bgcolor: tokens.cream }}>
          <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 40, lineHeight: 1 }}>
            {product ? formatUsd(product.price) : <Skeleton width={120} />}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {product ? `Ready in ${product.deliveryDays} days` : <Skeleton width={100} />}
          </Typography>
          <Box sx={{ my: 2.5 }}>{product && <BeadRow stock={product.stock} size={12} />}</Box>
          <Button variant="contained" size="large" fullWidth disabled={!product || soldOut} onClick={order}>
            {soldOut ? 'Fully booked this month' : 'Order this package'}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            You can add extras and describe your project on the next step.
          </Typography>
        </Paper>
        </Box>
      </Box>

      {product && (
        <Box sx={{ mt: { xs: 8, md: 10 }, maxWidth: 760 }}>
          <QuestionsSection productId={product.id} />
        </Box>
      )}
    </Container>
  )
}
