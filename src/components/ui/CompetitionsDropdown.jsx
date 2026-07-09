import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import LeagueLogo from './LeagueLogo'

const DEFAULT_FOOTBALL_LEAGUES = [
  { _id: '1',  name: 'Premier League',   slug: 'premier-league',   logo: '', country: 'England' },
  { _id: '2',  name: 'Championship',     slug: 'championship',     logo: '', country: 'England' },
  { _id: '3',  name: 'League One',       slug: 'league-one',       logo: '', country: 'England' },
  { _id: '4',  name: 'League Two',       slug: 'league-two',       logo: '', country: 'England' },
  { _id: '5',  name: 'Champions League', slug: 'champions-league', logo: '', country: 'Europe' },
  { _id: '6',  name: 'Europa League',    slug: 'europa-league',    logo: '', country: 'Europe' },
  { _id: '7',  name: 'La Liga',          slug: 'la-liga',          logo: '', country: 'Spain' },
  { _id: '8',  name: 'Serie A',          slug: 'serie-a',          logo: '', country: 'Italy' },
  { _id: '9',  name: 'Bundesliga',       slug: 'bundesliga',       logo: '', country: 'Germany' },
  { _id: '10', name: 'Ligue 1',          slug: 'ligue-1',          logo: '', country: 'France' },
]

export default function CompetitionsDropdown({ sport = 'football' }) {
  const [open, setOpen]         = useState(false)
  const [leagues, setLeagues]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [coords, setCoords]     = useState({ top: 0, left: 0 })

  const btnRef   = useRef(null)   // the trigger button
  const panelRef = useRef(null)   // the portaled dropdown panel

  useEffect(() => {
    setLoading(true)
    api.get('/leagues', { params: { sport } })
      .then(res => {
        const data = res.data.data || []
        setLeagues(data.length > 0 ? data : DEFAULT_FOOTBALL_LEAGUES)
      })
      .catch(() => setLeagues(DEFAULT_FOOTBALL_LEAGUES))
      .finally(() => setLoading(false))
  }, [sport])

  // Recompute the panel position every time it opens, and keep it pinned
  // to the button on scroll/resize (the sub-nav bar scrolls horizontally).
  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      if (!btnRef.current) return
      const rect = btnRef.current.getBoundingClientRect()
      const panelWidth = 240
      const margin = 8
      let left = rect.left
      if (left + panelWidth > window.innerWidth - margin) {
        left = window.innerWidth - panelWidth - margin
      }
      if (left < margin) left = margin
      setCoords({ top: rect.bottom, left })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  // Close on outside click — check both the button and the portaled panel,
  // since the panel no longer lives inside the button's DOM subtree.
  useEffect(() => {
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Group by country
  const grouped = leagues.reduce((acc, league) => {
    const key = league.country || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(league)
    return acc
  }, {})

  return (
    <>
      {/* Trigger button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-3 md:px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
          open
            ? 'text-primary border-primary'
            : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
        }`}
      >
        Competitions
        <svg style={{ width: 10, height: 10, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel — portaled to <body> so it escapes the sub-nav's
          overflow-x-auto (which otherwise clips it vertically to nothing) */}
      {open && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            background: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            width: 240,
            maxWidth: 'calc(100vw - 16px)',
            maxHeight: '70vh',
            overflowY: 'auto',
            borderRadius: '0 0 8px 8px',
          }}
        >
          {loading ? (
            <div style={{ padding: 16 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ height: 36, background: '#f3f4f6', borderRadius: 6, marginBottom: 6 }} />
              ))}
            </div>
          ) : (
            Object.entries(grouped).map(([countryName, countryLeagues]) => (
              <div key={countryName}>
                {/* Country header */}
                <div style={{
                  padding: '8px 16px',
                  background: '#f9fafb',
                  borderBottom: '1px solid #f3f4f6',
                  borderTop: '1px solid #f3f4f6',
                  position: 'sticky',
                  top: 0,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af' }}>
                    {countryName}
                  </span>
                </div>

                {/* League rows */}
                {countryLeagues.map(league => (
                  <Link
                    key={league._id}
                    to={`/${sport}?tab=table&league=${league.slug}`}
                    onClick={() => setOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #f9fafb', textDecoration: 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LeagueLogo slug={league.slug} name={league.name} logo={league.logo} className="w-6 h-6" />
                    </div>
                    <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 500 }}>{league.name}</span>
                  </Link>
                ))}
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </>
  )
}