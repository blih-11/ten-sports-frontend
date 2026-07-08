import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import TeamLogo from './TeamLogo'
import LeagueLogo from './LeagueLogo'

const SPORT_LEAGUES = {
  football: [
    { slug: 'premier-league',   name: 'Premier League',   region: 'England' },
    { slug: 'championship',     name: 'Championship',     region: 'England' },
    { slug: 'champions-league', name: 'Champions League', region: 'Europe' },
    { slug: 'europa-league',    name: 'Europa League',    region: 'Europe' },
    { slug: 'la-liga',          name: 'La Liga',          region: 'Spain' },
    { slug: 'serie-a',          name: 'Serie A',          region: 'Italy' },
    { slug: 'bundesliga',       name: 'Bundesliga',       region: 'Germany' },
    { slug: 'ligue-1',          name: 'Ligue 1',          region: 'France' },
  ],
  nba:        [{ slug: 'nba',       name: 'NBA',         region: 'USA'    }],
  tennis:     [{ slug: 'tennis',    name: 'ATP Tour',    region: 'Global' }],
  'formula-1':[{ slug: 'formula-1', name: 'Formula 1',  region: 'Global' }],
  nfl:        [{ slug: 'nfl',       name: 'NFL',         region: 'USA'    }],
  rugby:      [{ slug: 'rugby',     name: 'Rugby Union', region: 'Global' }],
  boxing:     [{ slug: 'boxing',    name: 'Boxing',      region: 'Global' }],
}

// Reverse lookup so a "View table" link can point at the right sport's
// own Table tab (e.g. /football?tab=table&league=bundesliga).
function findSportForLeague(slug) {
  const entry = Object.entries(SPORT_LEAGUES).find(([, leagues]) => leagues.some(l => l.slug === slug))
  return entry ? entry[0] : 'football'
}

// ─── Date helpers ────────────────────────────────────────────────
function startOfDay(d) {
  const c = new Date(d); c.setHours(0,0,0,0); return c
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function buildDays(anchor) {
  const days = []
  for (let i = -15; i <= 15; i++) {
    const d = new Date(anchor)
    d.setDate(anchor.getDate() + i)
    days.push(startOfDay(d))
  }
  return days
}

function formatGroupDate(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function groupByCompetition(fixtures) {
  const groups = {}
  for (const f of fixtures) {
    const key = f.league?._id || f.league?.name || 'other'
    if (!groups[key]) groups[key] = { league: f.league, fixtures: [] }
    groups[key].fixtures.push(f)
  }
  return Object.values(groups)
}

// ─── Match row ───────────────────────────────────────────────────
function MatchRow({ fixture }) {
  const isLive     = ['1H','2H','HT','ET','P'].includes(fixture.status?.short)
  const isFinished = fixture.status?.short === 'FT'
  const isUpcoming = fixture.status?.short === 'NS'

  const homeScore = fixture.score?.home
  const awayScore = fixture.score?.away
  const homeWin   = isFinished && homeScore > awayScore
  const awayWin   = isFinished && awayScore > homeScore
  const draw      = isFinished && homeScore === awayScore

  const homeBar = homeWin ? 'bg-green-500' : awayWin ? 'bg-red-500' : draw ? 'bg-gray-400' : 'bg-transparent'
  const awayBar = awayWin ? 'bg-green-500' : homeWin ? 'bg-red-500' : draw ? 'bg-gray-400' : 'bg-transparent'

  return (
    <Link
      to={`/match/${fixture._id}`}
      className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
    >
      {/* Home name */}
      <span className="flex-1 text-right text-[10px] sm:text-xs md:text-sm font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
        {fixture.homeTeam?.name}
      </span>

      {/* Home logo */}
      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 shrink-0 flex items-center justify-center">
        <TeamLogo name={fixture.homeTeam?.name} className="w-full h-full" />
      </div>

      {/* Score / time */}
      <div className="flex items-center gap-1 shrink-0 min-w-[52px] sm:min-w-[64px] justify-center">
        {isUpcoming ? (
          <span className="text-gray-700 text-[10px] sm:text-xs md:text-sm font-bold">
            {new Date(fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : (
          <div className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <span className={`text-sm sm:text-base md:text-lg font-black leading-none ${isLive ? 'text-primary' : 'text-gray-900'}`}>
                {homeScore ?? '-'}
              </span>
              {isFinished && <span className={`mt-1 h-0.5 w-3 sm:w-4 rounded-full ${homeBar}`} />}
            </div>
            <span className="text-gray-400 font-bold text-xs sm:text-sm">-</span>
            <div className="flex flex-col items-center">
              <span className={`text-sm sm:text-base md:text-lg font-black leading-none ${isLive ? 'text-primary' : 'text-gray-900'}`}>
                {awayScore ?? '-'}
              </span>
              {isFinished && <span className={`mt-1 h-0.5 w-3 sm:w-4 rounded-full ${awayBar}`} />}
            </div>
          </div>
        )}
      </div>

      {/* Away logo */}
      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 shrink-0 flex items-center justify-center">
        <TeamLogo name={fixture.awayTeam?.name} className="w-full h-full" />
      </div>

      {/* Away name */}
      <span className="flex-1 text-left text-[10px] sm:text-xs md:text-sm font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
        {fixture.awayTeam?.name}
      </span>
    </Link>
  )
}

// ─── Competition block ───────────────────────────────────────────
function CompetitionBlock({ group }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <LeagueLogo slug={group.league?.slug} name={group.league?.name} className="w-6 h-6" />
          <span className="text-sm font-black text-gray-800">
            {group.league?.name || 'Competition'}
          </span>
          <span className="text-gray-300 text-sm">›</span>
        </div>
        <Link
          to={`/${findSportForLeague(group.league?.slug)}?tab=table&league=${group.league?.slug || ''}`}
          onClick={e => e.stopPropagation()}
          className="text-primary text-xs font-bold hover:underline"
        >
          View table ›
        </Link>
      </div>

      {group.fixtures[0]?.round && (
        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
          <span className="text-gray-500 text-xs font-medium">{group.fixtures[0].round}</span>
        </div>
      )}

      <div>
        {group.fixtures.map(f => <MatchRow key={f._id} fixture={f} />)}
      </div>
    </div>
  )
}

// ─── Date slider ─────────────────────────────────────────────────
 

function DateSlider({ selected, onSelect }) {
  const today = startOfDay(new Date())
  const days  = buildDays(startOfDay(selected))
  const ref   = useRef(null)

  // Always keep selected day centered
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const active = el.querySelector('[data-selected="true"]')
    if (!active) return
    const scrollTo = active.offsetLeft - (el.clientWidth / 2) + (active.offsetWidth / 2)
    el.scrollTo({ left: scrollTo, behavior: 'smooth' })
  }, [selected])

  const monthLabel = selected.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-5 overflow-hidden w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => { const d = new Date(selected); d.setDate(d.getDate() - 7); onSelect(startOfDay(d)) }}
          className="text-gray-400 hover:text-dark transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-lg"
        >‹</button>
        <span className="text-sm font-black text-gray-700">{monthLabel}</span>
        <button
          onClick={() => { const d = new Date(selected); d.setDate(d.getDate() + 7); onSelect(startOfDay(d)) }}
          className="text-primary hover:text-yellow-500 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-yellow-50 text-lg font-bold"
        >›</button>
      </div>

      <div
        ref={ref}
        className="flex overflow-x-auto py-3 px-4 gap-1.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((d, i) => {
          const isSel = isSameDay(d, selected)
          const isTod = isSameDay(d, today)
          return (
            <button
              key={i}
              data-selected={isSel ? 'true' : undefined}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-center justify-center px-3 py-2.5 rounded-xl shrink-0 min-w-[52px] transition-all ${
                isSel
                  ? 'bg-primary text-dark'
                  : isTod
                  ? 'bg-gray-100 text-gray-800 font-bold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide leading-tight">
                {d.toLocaleDateString('en-GB', { weekday: 'short' })}
              </span>
              <span className={`text-base leading-tight ${isSel || isTod ? 'font-black' : 'font-bold'}`}>
                {d.getDate()}
              </span>
              <span className="text-[10px] leading-tight opacity-60">
                {d.toLocaleDateString('en-GB', { month: 'short' })}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
// ─── Left sidebar ────────────────────────────────────────────────
function LeagueSidebar({ leagues, activeLeague, onSelect }) {
  const regions = {}
  for (const l of leagues) {
    const r = l.region || 'Other'
    if (!regions[r]) regions[r] = []
    regions[r].push(l)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Competitions</h3>
      </div>
      <nav className="p-2">
        {Object.entries(regions).map(([region, ls]) => (
          <div key={region} className="mb-3">
            {Object.keys(regions).length > 1 && (
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 px-3 py-1">
                {region}
              </p>
            )}
            {ls.map(l => (
              <button
                key={l.slug}
                onClick={() => onSelect(l.slug)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-0.5 ${
                  activeLeague === l.slug
                    ? 'bg-primary text-dark font-bold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <LeagueLogo slug={l.slug} name={l.name} className="w-5 h-5 shrink-0" />
                <span className="truncate">{l.name}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────
export default function ResultsTab({ categorySlug }) {
  const leagues = SPORT_LEAGUES[categorySlug] || []
  const today   = startOfDay(new Date())

  const [activeLeague, setActiveLeague] = useState(leagues[0]?.slug || '')
  const [selectedDate, setSelectedDate] = useState(today)
  const [fixtures,     setFixtures]     = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const first = (SPORT_LEAGUES[categorySlug] || [])[0]?.slug || ''
    setActiveLeague(first)
  }, [categorySlug])

  useEffect(() => {
    if (!activeLeague) { setLoading(false); return }
    setLoading(true)
    const dateStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, '0'),
      String(selectedDate.getDate()).padStart(2, '0'),
    ].join('-')

    api.get('/fixtures', {
      params: { leagueSlug: activeLeague, date: dateStr, limit: 50 }
    })
      .then(res => setFixtures(res.data.data || []))
      .catch(() => setFixtures([]))
      .finally(() => setLoading(false))
  }, [activeLeague, selectedDate])

  if (leagues.length === 0) return (
    <div className="py-16 text-center text-gray-400">
      <p className="font-semibold">No fixture data available for this sport yet.</p>
    </div>
  )

  const groups    = groupByCompetition(fixtures)
  const dateLabel = formatGroupDate(selectedDate)

  return (
    <div className="py-4">
      <div className="flex gap-6">

        {/* Left sidebar — desktop only */}
        <aside className="hidden lg:block w-52 shrink-0">
          <LeagueSidebar
            leagues={leagues}
            activeLeague={activeLeague}
            onSelect={setActiveLeague}
          />
        </aside>

        {/* Right: date slider + fixtures */}
        <div className="flex-1 min-w-0">

          {/* Mobile league pills */}
          {leagues.length > 1 && (
            <div
              className="lg:hidden flex gap-2 overflow-x-auto pb-1 mb-4"
              style={{ scrollbarWidth: 'none' }}
            >
              {leagues.map(l => (
                <button
                  key={l.slug}
                  onClick={() => setActiveLeague(l.slug)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 transition-all ${
                    activeLeague === l.slug
                      ? 'bg-primary text-dark'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <LeagueLogo slug={l.slug} name={l.name} className="w-4 h-4" />
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          )}

          <DateSlider selected={selectedDate} onSelect={setSelectedDate} />

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
              ))}
            </div>
          ) : fixtures.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-14 text-center shadow-sm">
              <p className="text-gray-600 font-bold text-base">{dateLabel}</p>
              <p className="text-gray-400 text-sm mt-1">No fixtures scheduled for this date.</p>
              <p className="text-gray-300 text-xs mt-0.5">Try a different date or competition.</p>
            </div>
          ) : (
            <>
              <h3 className="text-gray-700 font-black text-base mb-4">{dateLabel}</h3>
              {groups.map((group, i) => (
                <CompetitionBlock key={i} group={group} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}