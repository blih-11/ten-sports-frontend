import { createContext, useContext, useState } from 'react'

const ActiveSportContext = createContext({
  forcedSport: null,
  hideSubnav: false,
  setForcedSport: () => {},
})

export function ActiveSportProvider({ children }) {
  const [forcedSport, setForcedSportState] = useState(null)
  const [hideSubnav, setHideSubnav] = useState(false)

  // options: { hideSubnav?: boolean } — pass hideSubnav: true when a page
  // should highlight the sport in the main nav but NOT show the sport's
  // sub-nav tabs bar (e.g. the article page, which has its own News bar).
  const setForcedSport = (slug, options = {}) => {
    setForcedSportState(slug)
    setHideSubnav(!!options.hideSubnav)
  }

  return (
    <ActiveSportContext.Provider value={{ forcedSport, hideSubnav, setForcedSport }}>
      {children}
    </ActiveSportContext.Provider>
  )
}

// Pages that belong to a sport but don't live under /{sport} in the URL
// (e.g. /article/:slug, /match/:id) call this with the sport's slug on
// mount so the Navbar's desktop sub-nav bar shows the right sport tabs,
// and clear it (pass null) on unmount so other pages aren't affected.
export function useActiveSport() {
  return useContext(ActiveSportContext)
}