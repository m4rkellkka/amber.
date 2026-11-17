import { useCallback, useEffect, useState } from 'react'
import { fetchProducts } from '../api/catalog'
import { errorMessage } from '../api/client'
import type { Product } from '../api/types'

interface CatalogState {
  packages: Product[]
  addons: Product[]
  loading: boolean
  error: string | null
  /** Loads the catalog again, e.g. after an order took a slot. */
  reload: () => void
}

/** Loads all active products once per page and splits them into packages and add-ons. */
export function useCatalog(): CatalogState {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchProducts()
      .then((data) => { if (!cancelled) { setProducts(data); setError(null) } })
      .catch((e) => { if (!cancelled) setError(errorMessage(e, 'Could not load packages.')) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [version])

  const reload = useCallback(() => {
    setLoading(true)
    setVersion((v) => v + 1)
  }, [])

  return {
    packages: products.filter((p) => p.type === 'PACKAGE'),
    addons: products.filter((p) => p.type === 'ADDON'),
    loading,
    error,
    reload,
  }
}
