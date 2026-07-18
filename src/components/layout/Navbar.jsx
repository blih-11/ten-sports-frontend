import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import TeamsDropdown from '../ui/TeamsDropdown'
import CompetitionsDropdown from '../ui/CompetitionsDropdown'
import { useActiveSport } from '../../context/ActiveSportContext'
import { getNavItems } from '../../utils/api'
import { FALLBACK_SPORTS } from '../../data/navSports'

// Sub-nav per sport — shown as a second bar when inside that sport's section
const FALLBACK_SPORT_SUBNAV = {
  football: [
    { label: 'News',               to: '/football' },
    { label: 'Results & Fixtures', to: '/football?tab=results' },
    { label: 'Transfers',          to: '/transfer-news' },
    { label: 'Teams',              to: '/football?tab=teams' },
    { label: 'Competitions',       to: '/football?tab=competitions' },
    { label: 'Table',              to: '/football?tab=table' },
  ],
  tennis: [
    { label: 'News',               to: '/tennis' },
    { label: 'Standings',          to: '/tennis?tab=standings' },
    { label: 'Results & Fixtures', to: '/tennis?tab=results' },
  ],
  'formula-1': [
    { label: 'News',               to: '/formula-1' },
    { label: 'Standings',          to: '/formula-1?tab=standings' },
    { label: 'Results & Fixtures', to: '/formula-1?tab=results' },
  ],
  nfl: [
    { label: 'News',               to: '/nfl' },
    { label: 'Standings',          to: '/nfl?tab=standings' },
    { label: 'Results & Fixtures', to: '/nfl?tab=results' },
  ],
  nba: [
    { label: 'News',               to: '/nba' },
    { label: 'Standings',          to: '/nba?tab=standings' },
    { label: 'Results & Fixtures', to: '/nba?tab=results' },
  ],
  rugby: [
    { label: 'News',               to: '/rugby' },
    { label: 'Standings',          to: '/rugby?tab=standings' },
    { label: 'Results & Fixtures', to: '/rugby?tab=results' },
  ],
  golf: [
    { label: 'News',               to: '/golf' },
    { label: 'Standings',          to: '/golf?tab=standings' },
    { label: 'Results & Fixtures', to: '/golf?tab=results' },
  ],
  boxing: [
    { label: 'News',               to: '/boxing' },
    { label: 'Standings',          to: '/boxing?tab=standings' },
    { label: 'Results & Fixtures', to: '/boxing?tab=results' },
  ],
}

function Dropdown({ label, items, isActive }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', overflow: 'visible' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
          isActive || open
            ? 'text-primary border-primary'
            : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
        }`}
      >
        {label}
        <svg
          style={{ width: 14, height: 14, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          background: '#ffffff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          borderRadius: '0 0 12px 12px',
          zIndex: 9999,
          minWidth: 380,
          padding: '12px 8px',
          overflow: 'visible',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
            {items.map(item => (
              <Link
                key={item.to || item.slug}
                to={item.to || `/${item.slug}`}
                onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '10px 16px', color: '#1a1a1a', fontSize: 14, fontWeight: 500, borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Ref used to measure where "Sports" sits in the top nav row, so any
  // sub-nav bar (here, and on other pages like team pages) can line
  // its left edge up underneath it on desktop.
  const topNavRowRef = useRef(null)
  const sportsWrapRef = useRef(null)

  const { forcedSport, hideSubnav } = useActiveSport()

  const [sports, setSports] = useState(FALLBACK_SPORTS)
  const [sportSubnav, setSportSubnav] = useState(FALLBACK_SPORT_SUBNAV)

  useEffect(() => {
    getNavItems()
      .then(res => {
        const items = res.data?.data
        if (!Array.isArray(items) || !items.length) return // keep fallback if empty/unexpected
        setSports(items.map(i => ({ label: i.label, slug: i.slug })))
        const subnavMap = {}
        items.forEach(i => {
          subnavMap[i.slug] = [...(i.subnav || [])]
            .sort((a, b) => a.order - b.order)
            .map(t => ({
              label: t.label,
              to: t.tab === 'news' ? `/${i.slug}` : t.tab === 'transfers' ? '/transfer-news' : `/${i.slug}?tab=${t.tab}`,
            }))
        })
        setSportSubnav(subnavMap)
      })
      .catch(() => {}) // API down/unreachable — keep the fallback nav, don't break the header
  }, [])

  // Detect which sport section we're in — a page can force this via
  // ActiveSportContext (e.g. an article or match page), otherwise it's
  // worked out from the URL path.
  const activeSport = sports.find(s => s.slug === forcedSport) || sports.find(s =>
    location.pathname.startsWith(`/${s.slug}`) ||
    (s.slug === 'football' && ['/analysis', '/opinion', '/previews'].some(p => location.pathname.startsWith(p)))
  )

  const subNav = activeSport && !hideSubnav ? sportSubnav[activeSport.slug] : null

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Measure how far "Sports" sits from the left edge of the nav row, and
  // publish it as a CSS variable any sub-nav bar in the app can read — so
  // every second-level nav (sport sub-nav, team page sub-nav, etc.) lines
  // up under "Sports" on desktop. Left untouched on mobile since consumers
  // only apply it at the md: breakpoint.
  useEffect(() => {
    const computeOffset = () => {
      if (!topNavRowRef.current || !sportsWrapRef.current) return
      const containerRect = topNavRowRef.current.getBoundingClientRect()
      const targetRect = sportsWrapRef.current.getBoundingClientRect()
      const offset = Math.max(0, Math.round(targetRect.left - containerRect.left))
      document.documentElement.style.setProperty('--subnav-offset', `${offset}px`)
    }
    computeOffset()
    window.addEventListener('resize', computeOffset)
    return () => window.removeEventListener('resize', computeOffset)
  }, [location.pathname])

  useEffect(() => {
    setMenuOpen(false)
    setMobileSection(null)
  }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${search}`)
      setSearch('')
      setSearchOpen(false)
    }
  }

  // Sports dropdown items shaped for Dropdown component
  const sportsDropdownItems = sports.map(s => ({ label: s.label, to: `/${s.slug}` }))
  // Results & Fixtures dropdown — only sports whose subnav actually has a
  // results tab (some sports are News-only for now, see seedNavItems.js)
  const resultsDropdownItems = sports
    .filter(s => sportSubnav[s.slug]?.some(t => t.to.includes('tab=results')))
    .map(s => ({ label: s.label, to: `/${s.slug}?tab=results` }))

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 2147483647, boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none' }}>

      {/* Top bar */}
      <div className="bg-darker text-gray-500 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="hidden sm:block">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <div className="flex gap-4">
            {['Twitter', 'Facebook', 'Instagram', 'YouTube'].map(s => (
              <a key={s} href="#" className="hover:text-white transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Main header — logo + search + subscribe */}
      <div className="bg-black border-b-4 border-primary" style={{ overflow: 'visible' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex-shrink-0">
            <span className="text-white font-black text-2xl tracking-tight">
              TAVE <span className="text-primary">SPORTS</span>
            </span>
          </Link>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-surface text-white px-4 py-2 rounded-lg text-sm outline-none border border-gray-700 focus:border-primary w-48"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="text-gray-400 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
            <Link to="/contact" className="bg-primary text-dark px-4 py-2 rounded-lg text-sm font-black hover:bg-yellow-300 transition-colors">
              Subscribe
            </Link>
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-gray-400 hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-white" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden border-t border-gray-800 px-4 py-2">
            <form onSubmit={handleSearch}>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-surface text-white px-4 py-2.5 rounded-lg text-sm outline-none border border-gray-700 focus:border-primary"
              />
            </form>
          </div>
        )}

        {/* ── Desktop main nav ── */}
        <div className="hidden md:block border-t border-gray-800" style={{ overflow: 'visible' }}>
          <div ref={topNavRowRef} className="max-w-7xl mx-auto px-4 flex items-center" style={{ overflow: 'visible' }}>

            <NavLink
              to="/" end
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                }`
              }
            >Home</NavLink>

            <div ref={sportsWrapRef}>
              <Dropdown
                label="Sports"
                items={sportsDropdownItems}
                isActive={!!activeSport}
              />
            </div>

            <Dropdown
              label="Results & Fixtures"
              items={resultsDropdownItems}
              isActive={location.search.includes('tab=results')}
            />

            <NavLink
              to="/transfer-news"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                }`
              }
            >Transfers</NavLink>

          </div>
        </div>
      </div>

      {/* ── Sport sub-nav bar — appears when inside a sport section ── */}
      {/* ── Sport sub-nav bar ── */}
{subNav && (
  <div className="bg-surface border-b border-gray-800">
    <div className="max-w-7xl mx-auto px-4">
      <nav className="flex items-center overflow-x-auto scrollbar-hide md:pl-[var(--subnav-offset)]">
  <span className="text-primary font-black text-xs uppercase tracking-widest whitespace-nowrap pr-3 py-2.5 border-r border-gray-700 mr-1 shrink-0">
    {activeSport.label}
  </span>
  {subNav.map(item => {
    // Teams and Competitions get a dropdown instead of a plain link
    if (item.label === 'Teams') {
      return (
        <TeamsDropdown
          key={item.to}
          sport={activeSport.slug}
          trigger="Teams"
        />
      )
    }
    if (item.label === 'Competitions') {
      return (
        <CompetitionsDropdown
          key={item.to}
          sport={activeSport.slug}
          trigger="Competitions"
        />
      )
    }

    const isNewsTab  = item.to === `/${activeSport.slug}` && !location.search.includes('tab=')
    const isOtherTab = location.pathname + location.search === item.to
    const isActive   = isNewsTab || isOtherTab

    return (
      <Link
        key={item.to}
        to={item.to}
        className={`px-3 md:px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
          isActive
            ? 'text-primary border-primary'
            : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
        }`}
      >
        {item.label}
      </Link>
    )
  })}
</nav>
    </div>
  </div>
)}

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-dark border-t border-gray-800" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="px-4 py-3 space-y-1">

            <NavLink to="/" end onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-primary text-dark font-bold' : 'text-gray-300 hover:bg-surface'}`}
            >Home</NavLink>

            {/* Sports accordion */}
            <button
              onClick={() => setMobileSection(mobileSection === 'sports' ? null : 'sports')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-surface"
            >
              <span>Sports</span>
              <svg style={{ width: 16, height: 16, transform: mobileSection === 'sports' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {mobileSection === 'sports' && (
              <div className="ml-3 pl-3 border-l border-gray-700 space-y-1">
                {sports.map(s => (
                  <Link key={s.slug} to={`/${s.slug}`} onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-400 hover:text-primary hover:bg-surface rounded-lg">
                    {s.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Results & Fixtures accordion */}
            <button
              onClick={() => setMobileSection(mobileSection === 'results' ? null : 'results')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-surface"
            >
              <span>Results & Fixtures</span>
              <svg style={{ width: 16, height: 16, transform: mobileSection === 'results' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {mobileSection === 'results' && (
              <div className="ml-3 pl-3 border-l border-gray-700 space-y-1">
                {resultsDropdownItems.map(s => (
                  <Link key={s.to} to={s.to} onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-400 hover:text-primary hover:bg-surface rounded-lg">
                    {s.label}
                  </Link>
                ))}
              </div>
            )}

            <NavLink to="/transfer-news" onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-primary text-dark font-bold' : 'text-gray-300 hover:bg-surface'}`}
            >Transfers</NavLink>

            {/* Sport sub-nav in mobile — shows if inside a sport */}
            {activeSport && subNav && (
              <div className="pt-3 mt-2 border-t border-gray-800">
                <p className="text-primary text-xs font-black uppercase tracking-widest px-3 mb-2">{activeSport.label}</p>
                {subNav.map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-surface hover:text-primary">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-gray-800">
              <Link to="/contact" onClick={() => setMenuOpen(false)}
                className="block text-center bg-primary text-dark px-4 py-2.5 rounded-lg text-sm font-black hover:bg-yellow-300 transition-colors">
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}