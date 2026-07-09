import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../utils/api'
import SidebarStandings from './SidebarStandings'
import LeagueLogo from './LeagueLogo'

const DEFAULT_LEAGUES = [
  { slug: 'premier-league',   name: 'Premier League' },
  { slug: 'championship',     name: 'Championship' },
  { slug: 'league-one',       name: 'League One' },
  { slug: 'league-two',       name: 'League Two' },
  { slug: 'champions-league', name: 'Champions League' },
  { slug: 'europa-league',    name: 'Europa League' },
  { slug: 'la-liga',          name: 'La Liga' },
  { slug: 'serie-a',          name: 'Serie A' },
  { slug: 'bundesliga',       name: 'Bundesliga' },
  { slug: 'ligue-1',          name: 'Ligue 1' },
]

const seasonLabel = (season) => {
  if (!season) return null
  if (typeof season === 'number') return `${season}/${((season + 1) % 100).toString().padStart(2, '0')}`
  return season
}

export default function TableTab({ sport = 'football', compact = false }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeLeague = searchParams.get('league') || 'premier-league'

  const [leagues, setLeagues] = useState(DEFAULT_LEAGUES)

  const scrollerRef = useRef(null)     // the horizontally-scrolling pill row
  const activeBtnRef = useRef(null)    // the currently-selected pill

  // Pull the real list of leagues for this sport, same source the
  // Competitions dropdown in the navbar uses — falls back to the
  // default list if none are synced yet.
  useEffect(() => {
    api.get('/leagues', { params: { sport } })
      .then(res => {
        const data = res.data.data || []
        if (data.length > 0) setLeagues(data)
      })
      .catch(() => {})
  }, [sport])

  const handleSelect = (slug) => {
    const next = new URLSearchParams(searchParams)
    next.set('league', slug)
    setSearchParams(next, { replace: true })
  }

  const activeMeta = leagues.find(l => l.slug === activeLeague) || { slug: activeLeague, name: activeLeague }
  const activeIndex = leagues.findIndex(l => l.slug === activeLeague)

  // Keep the selected pill centered in the row. If it's near the very
  // start (e.g. the first league), the scroll position simply clamps to
  // 0 — the browser won't scroll past the beginning, so it naturally
  // "just starts" from the first pill instead of leaving empty space.
  useEffect(() => {
    const container = scrollerRef.current
    const btn = activeBtnRef.current
    if (!container || !btn) return

    const target = btn.offsetLeft - (container.clientWidth / 2) + (btn.clientWidth / 2)
    container.scrollTo({ left: target, behavior: 'smooth' })
  }, [activeLeague, leagues])

  const handlePrev = () => {
    if (leagues.length === 0) return
    const i = activeIndex === -1 ? 0 : activeIndex
    const prevIndex = (i - 1 + leagues.length) % leagues.length
    handleSelect(leagues[prevIndex].slug)
  }

  const handleNext = () => {
    if (leagues.length === 0) return
    const i = activeIndex === -1 ? 0 : activeIndex
    const nextIndex = (i + 1) % leagues.length
    handleSelect(leagues[nextIndex].slug)
  }

  return (
    <div className={compact ? '' : 'mt-6'}>
      {/* League switcher */}
      <div ref={scrollerRef} className={`flex items-center gap-2 overflow-x-auto scrollbar-hide ${compact ? 'pb-2 mb-2' : 'pb-3 mb-4'}`}>
        {leagues.map(l => (
          <button
            key={l.slug}
            ref={l.slug === activeLeague ? activeBtnRef : null}
            onClick={() => handleSelect(l.slug)}
            className={`shrink-0 flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap transition-all border ${
              compact ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2 text-xs'
            } ${
              activeLeague === l.slug
                ? 'bg-primary text-dark border-primary'
                : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'
            }`}
          >
            <LeagueLogo slug={l.slug} name={l.name} logo={l.logo} className="w-4 h-4" />
            {l.name}
          </button>
        ))}
      </div>

      <div className={compact ? '' : 'max-w-lg mx-auto'}>
        <SidebarStandings
          categorySlug={sport}
          showFull={!compact}
          league={{ slug: activeMeta.slug, name: activeMeta.name, season: seasonLabel(activeMeta.season) }}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>
    </div>
  )
}