import { useEffect } from 'react'

const SITE = 'amber'

/** Sets the browser tab title, e.g. "My orders · amber". */
export function usePageTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} — websites and chatbots in Istanbul`
  }, [title])
}
