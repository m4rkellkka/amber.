import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { Alert, Snackbar } from '@mui/material'

type Severity = 'success' | 'error' | 'info'
type Notify = (message: string, severity?: Severity) => void

const NotifyContext = createContext<Notify>(() => undefined)

/** Short pop-up messages at the bottom of the screen ("Saved", "Could not save"). */
export function NotifyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ message: string; severity: Severity; key: number } | null>(null)
  const notify = useCallback<Notify>((message, severity = 'success') => {
    setState({ message, severity, key: Date.now() })
  }, [])

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <Snackbar key={state?.key} open={state !== null} autoHideDuration={4000} onClose={() => setState(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {state ? (
          <Alert severity={state.severity} variant="filled" onClose={() => setState(null)} sx={{ minWidth: 280 }}>
            {state.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotifyContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useNotify(): Notify {
  return useContext(NotifyContext)
}
