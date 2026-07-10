import { createContext, useContext, useEffect, useState } from 'react'
import { getPageSections } from '../utils/api'
import { initAdsense } from '../utils/ads'

const MonetizationContext = createContext({ loading: true, adsEnabled: false, slots: {} })

export function MonetizationProvider({ children }) {
  const [state, setState] = useState({ loading: true, adsEnabled: false, slots: {} })

  useEffect(() => {
    let cancelled = false
    getPageSections('monetization')
      .then(res => {
        if (cancelled) return
        const data = res.data?.data || {}
        const adsEnabled = !!data.ads_enabled
        if (adsEnabled && data.adsense_client_id) initAdsense(data.adsense_client_id)
        setState({
          loading: false,
          adsEnabled,
          responsibleGamblingNote: data.responsible_gambling_note || '',
          slots: data, // flat map, e.g. slots.slot_home_leaderboard
        })
      })
      .catch(() => {
        // If the endpoint fails (e.g. fresh install, not seeded yet) just
        // treat ads as off rather than breaking the page.
        if (!cancelled) setState({ loading: false, adsEnabled: false, slots: {} })
      })
    return () => { cancelled = true }
  }, [])

  return (
    <MonetizationContext.Provider value={state}>
      {children}
    </MonetizationContext.Provider>
  )
}

export function useMonetization() {
  return useContext(MonetizationContext)
}
