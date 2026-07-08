import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import TeamLogo from './TeamLogo'

const DEFAULT_FOOTBALL_TEAMS = [
  // ── Premier League (2025/26) ──────────────────────────────────
  { _id: 'pl-1',  name: 'Arsenal',                  slug: 'arsenal',                logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-2',  name: 'Aston Villa',               slug: 'aston-villa',            logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-3',  name: 'Bournemouth',               slug: 'bournemouth',            logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-4',  name: 'Brentford',                 slug: 'brentford',              logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-5',  name: 'Brighton',                  slug: 'brighton',               logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-6',  name: 'Burnley',                   slug: 'burnley',                logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-7',  name: 'Chelsea',                   slug: 'chelsea',                logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-8',  name: 'Crystal Palace',            slug: 'crystal-palace',         logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-9',  name: 'Everton',                   slug: 'everton',                logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-10', name: 'Fulham',                    slug: 'fulham',                 logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-11', name: 'Leeds United',               slug: 'leeds-united',           logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-12', name: 'Liverpool',                 slug: 'liverpool',              logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-13', name: 'Manchester City',           slug: 'manchester-city',        logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-14', name: 'Manchester United',         slug: 'manchester-united',      logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-15', name: 'Newcastle United',          slug: 'newcastle-united',       logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-16', name: 'Nottingham Forest',         slug: 'nottingham-forest',      logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-17', name: 'Sunderland',                slug: 'sunderland',             logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-18', name: 'Tottenham Hotspur',         slug: 'tottenham-hotspur',      logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-19', name: 'West Ham United',           slug: 'west-ham-united',        logo: '', league: { name: 'Premier League' } },
  { _id: 'pl-20', name: 'Wolverhampton',             slug: 'wolverhampton',          logo: '', league: { name: 'Premier League' } },

  // ── Championship (2025/26) ────────────────────────────────────
  { _id: 'ch-1',  name: 'Birmingham City',           slug: 'birmingham-city',        logo: '', league: { name: 'Championship' } },
  { _id: 'ch-2',  name: 'Blackburn Rovers',          slug: 'blackburn-rovers',       logo: '', league: { name: 'Championship' } },
  { _id: 'ch-3',  name: 'Bristol City',              slug: 'bristol-city',           logo: '', league: { name: 'Championship' } },
  { _id: 'ch-4',  name: 'Charlton Athletic',         slug: 'charlton-athletic',      logo: '', league: { name: 'Championship' } },
  { _id: 'ch-5',  name: 'Coventry City',             slug: 'coventry-city',          logo: '', league: { name: 'Championship' } },
  { _id: 'ch-6',  name: 'Derby County',              slug: 'derby-county',           logo: '', league: { name: 'Championship' } },
  { _id: 'ch-7',  name: 'Hull City',                 slug: 'hull-city',              logo: '', league: { name: 'Championship' } },
  { _id: 'ch-8',  name: 'Ipswich Town',              slug: 'ipswich-town',           logo: '', league: { name: 'Championship' } },
  { _id: 'ch-9',  name: 'Leicester City',            slug: 'leicester-city',         logo: '', league: { name: 'Championship' } },
  { _id: 'ch-10', name: 'Middlesbrough',             slug: 'middlesbrough',          logo: '', league: { name: 'Championship' } },
  { _id: 'ch-11', name: 'Millwall',                  slug: 'millwall',               logo: '', league: { name: 'Championship' } },
  { _id: 'ch-12', name: 'Norwich City',              slug: 'norwich-city',           logo: '', league: { name: 'Championship' } },
  { _id: 'ch-13', name: 'Oxford United',             slug: 'oxford-united',          logo: '', league: { name: 'Championship' } },
  { _id: 'ch-14', name: 'Portsmouth',                slug: 'portsmouth',             logo: '', league: { name: 'Championship' } },
  { _id: 'ch-15', name: 'Preston North End',         slug: 'preston-north-end',      logo: '', league: { name: 'Championship' } },
  { _id: 'ch-16', name: 'Queens Park Rangers',       slug: 'queens-park-rangers',    logo: '', league: { name: 'Championship' } },
  { _id: 'ch-17', name: 'Sheffield United',          slug: 'sheffield-united',       logo: '', league: { name: 'Championship' } },
  { _id: 'ch-18', name: 'Sheffield Wednesday',       slug: 'sheffield-wednesday',    logo: '', league: { name: 'Championship' } },
  { _id: 'ch-19', name: 'Southampton',               slug: 'southampton',            logo: '', league: { name: 'Championship' } },
  { _id: 'ch-20', name: 'Stoke City',                slug: 'stoke-city',             logo: '', league: { name: 'Championship' } },
  { _id: 'ch-21', name: 'Swansea City',              slug: 'swansea-city',           logo: '', league: { name: 'Championship' } },
  { _id: 'ch-22', name: 'Watford',                   slug: 'watford',                logo: '', league: { name: 'Championship' } },
  { _id: 'ch-23', name: 'West Bromwich Albion',      slug: 'west-bromwich-albion',   logo: '', league: { name: 'Championship' } },
  { _id: 'ch-24', name: 'Wrexham',                   slug: 'wrexham',                logo: '', league: { name: 'Championship' } },

  // ── La Liga (2025/26) ─────────────────────────────────────────
  { _id: 'll-1',  name: 'Real Madrid',               slug: 'real-madrid',            logo: '', league: { name: 'La Liga' } },
  { _id: 'll-2',  name: 'Barcelona',                 slug: 'barcelona',              logo: '', league: { name: 'La Liga' } },
  { _id: 'll-3',  name: 'Atletico Madrid',           slug: 'atletico-madrid',        logo: '', league: { name: 'La Liga' } },
  { _id: 'll-4',  name: 'Athletic Club',             slug: 'athletic-club',          logo: '', league: { name: 'La Liga' } },
  { _id: 'll-5',  name: 'Villarreal',                slug: 'villarreal',             logo: '', league: { name: 'La Liga' } },
  { _id: 'll-6',  name: 'Real Betis',                slug: 'real-betis',             logo: '', league: { name: 'La Liga' } },
  { _id: 'll-7',  name: 'Real Sociedad',             slug: 'real-sociedad',          logo: '', league: { name: 'La Liga' } },
  { _id: 'll-8',  name: 'Mallorca',                  slug: 'mallorca',               logo: '', league: { name: 'La Liga' } },
  { _id: 'll-9',  name: 'Celta Vigo',                slug: 'celta',                  logo: '', league: { name: 'La Liga' } },
  { _id: 'll-10', name: 'Rayo Vallecano',            slug: 'rayo-vallecano',         logo: '', league: { name: 'La Liga' } },
  { _id: 'll-11', name: 'Osasuna',                   slug: 'osasuna',                logo: '', league: { name: 'La Liga' } },
  { _id: 'll-12', name: 'Getafe',                    slug: 'getafe',                 logo: '', league: { name: 'La Liga' } },
  { _id: 'll-13', name: 'Girona',                    slug: 'girona',                 logo: '', league: { name: 'La Liga' } },
  { _id: 'll-14', name: 'Sevilla',                   slug: 'sevilla',                logo: '', league: { name: 'La Liga' } },
  { _id: 'll-15', name: 'Valencia',                  slug: 'valencia',               logo: '', league: { name: 'La Liga' } },
  { _id: 'll-16', name: 'Espanyol',                  slug: 'espanyol',               logo: '', league: { name: 'La Liga' } },
  { _id: 'll-17', name: 'Deportivo Alaves',          slug: 'deportivo',              logo: '', league: { name: 'La Liga' } },
  { _id: 'll-18', name: 'Levante',                   slug: 'levante',                logo: '', league: { name: 'La Liga' } },
  { _id: 'll-19', name: 'Elche',                     slug: 'elche',                  logo: '', league: { name: 'La Liga' } },
  { _id: 'll-20', name: 'Real Oviedo',               slug: 'real-oviedo',            logo: '', league: { name: 'La Liga' } },

  // ── Serie A (2025/26) ─────────────────────────────────────────
  { _id: 'sa-1',  name: 'Napoli',                    slug: 'napoli',                 logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-2',  name: 'Inter Milan',               slug: 'inter',                  logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-3',  name: 'AC Milan',                  slug: 'milan',                  logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-4',  name: 'Juventus',                  slug: 'juventus',               logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-5',  name: 'Atalanta',                  slug: 'atalanta',               logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-6',  name: 'AS Roma',                   slug: 'roma',                   logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-7',  name: 'Lazio',                     slug: 'lazio',                  logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-8',  name: 'Fiorentina',                slug: 'fiorentina',             logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-9',  name: 'Bologna',                   slug: 'bologna',                logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-10', name: 'Torino',                    slug: 'torino',                 logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-11', name: 'Udinese',                   slug: 'udinese',                logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-12', name: 'Genoa',                     slug: 'genoa',                  logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-13', name: 'Cagliari',                  slug: 'cagliari',               logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-14', name: 'Hellas Verona',             slug: 'verona',                 logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-15', name: 'Parma',                     slug: 'parma',                  logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-16', name: 'Como',                      slug: 'como-1907',              logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-17', name: 'Lecce',                     slug: 'lecce',                  logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-18', name: 'Cremonese',                 slug: 'cremonese',              logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-19', name: 'Sassuolo',                  slug: 'sassuolo',               logo: '', league: { name: 'Serie A' } },
  { _id: 'sa-20', name: 'Pisa',                      slug: 'pisa',                   logo: '', league: { name: 'Serie A' } },

  // ── Bundesliga (2025/26) ──────────────────────────────────────
  { _id: 'bl-1',  name: 'Bayern Munich',             slug: 'bayern-munchen',         logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-2',  name: 'Bayer Leverkusen',          slug: 'bayer-leverkusen',       logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-3',  name: 'Eintracht Frankfurt',       slug: 'eintracht-frankfurt',    logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-4',  name: 'Borussia Dortmund',         slug: 'borussia-dortmund',      logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-5',  name: 'RB Leipzig',                slug: 'rb-leipzig',             logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-6',  name: 'SC Freiburg',               slug: 'freiburg',               logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-7',  name: 'Mainz 05',                  slug: 'mainz-05',               logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-8',  name: 'Werder Bremen',             slug: 'werder-bremen',          logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-9',  name: 'Borussia Monchengladbach',  slug: 'borussia-monchengladbach', logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-10', name: 'VfB Stuttgart',             slug: 'vfb-stuttgart',          logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-11', name: 'Wolfsburg',                 slug: 'wolfsburg',              logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-12', name: 'Union Berlin',              slug: 'union-berlin',           logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-13', name: 'Augsburg',                  slug: 'augsburg',               logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-14', name: 'Hoffenheim',                slug: 'hoffenheim',             logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-15', name: 'FC Heidenheim',             slug: 'fc-heidenheim',          logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-16', name: 'St. Pauli',                 slug: 'st-pauli',               logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-17', name: '1. FC Koln',                slug: 'koln',                   logo: '', league: { name: 'Bundesliga' } },
  { _id: 'bl-18', name: 'Hamburger SV',              slug: 'hamburger-sv',           logo: '', league: { name: 'Bundesliga' } },

  // ── Ligue 1 (2025/26) ─────────────────────────────────────────
  { _id: 'l1-1',  name: 'Paris Saint-Germain',       slug: 'paris-saint-germain',    logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-2',  name: 'Marseille',                 slug: 'marseille',              logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-3',  name: 'Monaco',                    slug: 'as-monaco',              logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-4',  name: 'Lille',                     slug: 'lille',                  logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-5',  name: 'Lyon',                      slug: 'lyon',                   logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-6',  name: 'Nice',                      slug: 'nice',                   logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-7',  name: 'RC Lens',                   slug: 'rc-lens',                logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-8',  name: 'Rennes',                    slug: 'rennes',                 logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-9',  name: 'Strasbourg',                slug: 'rc-strasbourg-alsace',   logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-10', name: 'Toulouse',                  slug: 'toulouse',               logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-11', name: 'Nantes',                    slug: 'nantes',                 logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-12', name: 'Brest',                     slug: 'brest',                  logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-13', name: 'Auxerre',                   slug: 'auxerre',                logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-14', name: 'Angers',                    slug: 'angers',                 logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-15', name: 'Le Havre',                  slug: 'le-havre-ac',            logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-16', name: 'FC Metz',                   slug: 'fc-metz',                logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-17', name: 'Paris FC',                  slug: 'paris-fc',               logo: '', league: { name: 'Ligue 1' } },
  { _id: 'l1-18', name: 'Lorient',                   slug: 'lorient',                logo: '', league: { name: 'Ligue 1' } },
]

export default function TeamsDropdown({ sport = 'football' }) {
  const [open, setOpen]       = useState(false)
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(false)
  const [coords, setCoords]   = useState({ top: 0, left: 0 })

  const btnRef   = useRef(null)   // the trigger button
  const panelRef = useRef(null)   // the portaled dropdown panel

  useEffect(() => {
    setLoading(true)
    api.get('/teams', { params: { sport } })
      .then(res => {
        const data = res.data.data || []
        setTeams(data.length > 0 ? data : DEFAULT_FOOTBALL_TEAMS)
      })
      .catch(() => setTeams(DEFAULT_FOOTBALL_TEAMS))
      .finally(() => setLoading(false))
  }, [sport])

  // Recompute the panel position every time it opens, and keep it pinned
  // to the button on scroll/resize (nav bar scrolls horizontally).
  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      if (!btnRef.current) return
      const rect = btnRef.current.getBoundingClientRect()
      const panelWidth = 240
      const margin = 8
      let left = rect.left
      // Clamp so the panel never runs off the right edge (narrow/mobile
      // screens) or the left edge.
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

  // Close on route change / escape key for good measure
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Group by league
  const grouped = teams.reduce((acc, team) => {
    const key = team.league?.name || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(team)
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
        Teams
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
            Object.entries(grouped).map(([leagueName, leagueTeams]) => (
              <div key={leagueName}>
                {/* League header */}
                <div style={{
                  padding: '8px 16px',
                  background: '#f9fafb',
                  borderBottom: '1px solid #f3f4f6',
                  borderTop: '1px solid #f3f4f6',
                  position: 'sticky',
                  top: 0,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af' }}>
                    {leagueName}
                  </span>
                </div>

                {/* Team rows */}
                {leagueTeams.map(team => (
                  <Link
                    key={team._id}
                    to={`/team/${team.slug}`}
                    onClick={() => setOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #f9fafb', textDecoration: 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TeamLogo name={team.name} className="w-6 h-6" />
                    </div>
                    <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 500 }}>{team.name}</span>
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