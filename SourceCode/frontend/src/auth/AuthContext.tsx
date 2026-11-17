import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onIdTokenChanged, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth } from './firebase'
import { api } from '../api/client'
import type { Me } from '../api/types'

interface AuthState {
  /** Firebase account (null = signed out). */
  user: User | null
  /** The same person as the back-end sees them, with the role. */
  me: Me | null
  /** True until Firebase reports the first auth state. */
  loading: boolean
  isAdmin: boolean
  signInOpen: boolean
  openSignIn: () => void
  closeSignIn: () => void
  signOut: () => Promise<void>
  /** Re-reads /api/me, e.g. after the display name changes. */
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [signInOpen, setSignInOpen] = useState(false)

  const loadMe = useCallback(async (current: User | null) => {
    if (!current) {
      setMe(null)
      return
    }
    try {
      const { data } = await api.get<Me>('/api/me')
      setMe(data)
    } catch {
      // Back-end down or token rejected: stay signed in to Firebase, but without a role.
      setMe(null)
    }
  }, [])

  useEffect(() => {
    // Fires on sign-in, sign-out and every token refresh.
    return onIdTokenChanged(auth, async (current) => {
      setUser(current)
      await loadMe(current)
      setLoading(false)
    })
  }, [loadMe])

  const value = useMemo<AuthState>(() => ({
    user,
    me,
    loading,
    isAdmin: me?.role === 'ADMIN',
    signInOpen,
    openSignIn: () => setSignInOpen(true),
    closeSignIn: () => setSignInOpen(false),
    signOut: () => firebaseSignOut(auth),
    refreshMe: () => loadMe(auth.currentUser),
  }), [user, me, loading, signInOpen, loadMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
