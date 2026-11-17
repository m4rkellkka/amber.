import { useEffect } from 'react'
import { useLocation } from 'react-router'

/** New page -> scroll to top; link like "/#packages" -> scroll to that section once it is rendered. */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    let tries = 0
    const id = window.setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el || ++tries > 20) {
        window.clearInterval(id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
    return () => window.clearInterval(id)
  }, [pathname, hash])
  return null
}
