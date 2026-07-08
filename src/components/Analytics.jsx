import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initGA, trackPageview } from '../utils/analytics'

// Mount once, inside <BrowserRouter>. Renders nothing — just watches the
// route and pings GA. Kept separate from analytics.js so the tracking
// logic stays framework-agnostic and this file is the only thing that
// knows about React Router.
export default function Analytics() {
  const location = useLocation()

  useEffect(() => { initGA() }, [])

  useEffect(() => {
    trackPageview(location.pathname + location.search)
  }, [location.pathname, location.search])

  return null
}