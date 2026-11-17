import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/** The order being put together: one package, add-ons with quantities, and the brief. */
export interface Cart {
  packageId: number | null
  /** productId -> quantity */
  addons: Record<number, number>
  brief: string
}

interface CartState extends Cart {
  choosePackage: (id: number) => void
  setAddon: (id: number, quantity: number) => void
  setBrief: (brief: string) => void
  clear: () => void
}

const STORAGE_KEY = 'amber.cart.v1'
const empty: Cart = { packageId: null, addons: {}, brief: '' }

function load(): Cart {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...empty, ...(JSON.parse(raw) as Partial<Cart>) } : empty
  } catch {
    return empty
  }
}

const CartContext = createContext<CartState | null>(null)

/** Keeps the cart in memory and in localStorage, so it survives a page reload. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(load)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // storage blocked (private mode): the cart still works for this visit
    }
  }, [cart])

  const value = useMemo<CartState>(() => ({
    ...cart,
    choosePackage: (id) => setCart((c) => ({ ...c, packageId: id })),
    setAddon: (id, quantity) => setCart((c) => {
      const addons = { ...c.addons }
      if (quantity > 0) addons[id] = quantity
      else delete addons[id]
      return { ...c, addons }
    }),
    setBrief: (brief) => setCart((c) => ({ ...c, brief })),
    clear: () => setCart(empty),
  }), [cart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
