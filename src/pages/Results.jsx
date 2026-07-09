import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../utils/api'
import TeamLogo from '../components/ui/TeamLogo'
import LeagueLogo from '../components/ui/LeagueLogo'

// ─── Sport → leagues map ─────────────────────────────────────────
const SPORT_LEAGUES = {
  football: [
    { slug: 'premier-league',   name: 'Premier League' },
    { slug: 'championship',     name: 'Championship' },
    { slug: 'champions-league', name: 'Champions League' },
    { slug: 'europa-league',    name: 'Europa League' },
    { slug: 'la-liga',          name: 'La Liga' },
    { slug: 'serie-a',          name: 'Serie A' },
    { slug: 'bundesliga',       name: 'Bundesliga' },
    { slug: 'ligue-1',          name: 'Ligue 1' },
  ],
  nba:        [{ slug: 'nba', name: 'NBA' }],
  tennis:     [{ slug: 'tennis', name: 'ATP Tour' }],
  'formula-1':[{ slug: 'formula-1', name: 'Formula 1' }],
  nfl:        [{ slug: 'nfl', name: 'NFL' }],
  rugby:      [{ slug: 'rugby', name: 'Rugby Union' }],
  boxing:     [{ slug: 'boxing', name: 'Boxing' }],
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

// Build 7 days before + today + 7 days after around an anchor date
function buildDays(anchor) {
  const days = []
  for (let i = -7; i <= 7; i++) {
    const d = new Date(anchor)
    d.setDate(anchor.getDate() + i)
    days.push(startOfDay(d))
  }
  return days
}

function formatSliderDay(d) {
  return {
    weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    date: d.getDate(),
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
  }
}

function formatGroupDate(d) {
  return d.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
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
  const homeWin    = isFinished && fixture.score?.home > fixture.score?.away
  const awayWin    = isFinished && fixture.score?.away > fixture.score?.home

  return (
    <Link
      to={`/match/${fixture._id}`}
      className="group flex items-center border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
    >
      {/* Mobile */}
      <div className="flex md:hidden w-full items-center gap-2 px-3 py-3">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <TeamLogo name={fixture.homeTeam?.name} logo={fixture.homeTeam?.logo} className="w-5 h-5" />
          <span className={`text-sm font-semibold truncate ${homeWin ? 'text-gray-900' : 'text-gray-500'}`}>
            {fixture.homeTeam?.name}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0 mx-1">
          {isUpcoming ? (
            <span className="text-gray-700 text-xs font-bold w-14 text-center">
              {new Date(fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <>
              <span className={`w-7 h-7 border border-gray-300 flex items-center justify-center text-xs font-black rounded ${isLive ? 'text-yellow-500 border-yellow-400' : 'text-gray-900'}`}>
                {fixture.score?.home ?? '-'}
              </span>
              <span className={`w-7 h-7 border border-gray-300 flex items-center justify-center text-xs font-black rounded ${isLive ? 'text-yellow-500 border-yellow-400' : 'text-gray-900'}`}>
                {fixture.score?.away ?? '-'}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          <span className={`text-sm font-semibold truncate text-right ${awayWin ? 'text-gray-900' : 'text-gray-500'}`}>
            {fixture.awayTeam?.name}
          </span>
          <TeamLogo name={fixture.awayTeam?.name} logo={fixture.awayTeam?.logo} className="w-5 h-5" />
        </div>

        <div className="w-6 shrink-0 text-right ml-1">
          {isLive
            ? <span className="text-yellow-500 text-[10px] font-black">{fixture.status?.elapsed}'</span>
            : isFinished
            ? <span className="text-gray-400 text[10px]">FT</span>
            : null}
        </div>
      </div>

      {/* Desktop — two matches side by side like Sky Sports */}
      <div className="hidden md:flex w-full items-stretch divide-x divide-gray-100">
        <div className="flex-1 flex items-center px-6 py-5 gap-3">
          {/* Home */}
          <div className="flex flex-col items-center gap-1 w-10 shrink-0">
            <TeamLogo name={fixture.homeTeam?.name} logo={fixture.homeTeam?.logo} className="w-9 h-9" />
          </div>
          <span className={`text-sm font-bold flex-1 min-w-0 ${homeWin ? 'text-gray-900' : 'text-gray-500'}`}>
            {fixture.homeTeam?.name}
          </span>

          {/* Time / score center */}
          <div className="flex flex-col items-center shrink-0 w-20">
            {isUpcoming ? (
              <span className="text-gray-800 text-sm font-bold">
                {new Date(fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              <>
                <div className="flex gap-1">
                  <span className={`w-8 h-8 border-2 border-gray-200 rounded flex items-center justify-center text-sm font-black ${isLive ? 'text-yellow-500 border-yellow-300' : 'text-gray-900'}`}>
                    {fixture.score?.home ?? '-'}
                  </span>
                  <span className={`w-8 h-8 border-2 border-gray-200 rounded flex items-center justify-center text-sm font-black ${isLive ? 'text-yellow-500 border-yellow-300' : 'text-gray-900'}`}>
                    {fixture.score?.away ?? '-'}
                  </span>
                </div>
                <span className="text-gray-400 text-[10px] font-semibold mt-0.5">
                  {isLive
                    ? <span className="text-yellow-500 font-black">{fixture.status?.elapsed}'</span>
                    : 'FT'}
                </span>
              </>
            )}
          </div>

          {/* Away */}
          <span className={`text-sm font-bold flex-1 min-w-0 text-right ${awayWin ? 'text-gray-900' : 'text-gray-500'}`}>
            {fixture.awayTeam?.name}
          </span>
          <div className="flex flex-col items-center gap-1 w-10 shrink-0">
            <TeamLogo name={fixture.awayTeam?.name} logo={fixture.awayTeam?.logo} className="w-9 h-9" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// Pair up fixtures for desktop 2-per-row layout
function FixturePairs({ fixtures }) {
  const pairs = []
  for (let i = 0; i < fixtures.length; i += 2) {
    pairs.push(fixtures.slice(i, i + 2))
  }
  return (
    <>
      {pairs.map((pair, pi) => (
        <div key={pi} className="hidden md:grid grid-cols-2 border-b border-gray-100 last:border-0 divide-x divide-gray-100">
          {pair.map(f => <DesktopMatchCell key={f._id} fixture={f} />)}
          {pair.length === 1 && <div />}
        </div>
      ))}
      {/* Mobile — single column */}
      <div className="md:hidden">
        {fixtures.map(f => <MatchRow key={f._id} fixture={f} />)}
      </div>
    </>
  )
}

function DesktopMatchCell({ fixture }) {
  const isLive     = ['1H','2H','HT','ET','P'].includes(fixture.status?.short)
  const isFinished = fixture.status?.short === 'FT'
  const isUpcoming = fixture.status?.short === 'NS'
  const homeWin    = isFinished && fixture.score?.home > fixture.score?.away
  const awayWin    = isFinished && fixture.score?.away > fixture.score?.home

  return (
    <Link
      to={`/match/${fixture._id}`}
      className="group flex items-center px-6 py-5 gap-3 hover:bg-gray-50 transition-colors"
    >
      <div className="w-9 h-9 shrink-0">
        <TeamLogo name={fixture.homeTeam?.name} logo={fixture.homeTeam?.logo} className="w-9 h-9" />
      </div>

      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
        <span className={`text-sm font-bold truncate ${homeWin ? 'text-gray-900' : 'text-gray-500'}`}>
          {fixture.homeTeam?.name}
        </span>
        <span className={`text-sm font-bold truncate ${awayWin ? 'text-gray-900' : 'text-gray-500'}`}>
          {fixture.awayTeam?.name}
        </span>
      </div>

      <div className="flex flex-col items-center shrink-0">
        {isUpcoming ? (
          <span className="text-gray-800 text-sm font-bold">
            {new Date(fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : (
          <>
            <div className="flex gap-1">
              <span className={`w-7 h-7 border border-gray-200 rounded flex items-center justify-center text-sm font-black ${isLive ? 'text-yellow-500' : 'text-gray-900'}`}>
                {fixture.score?.home ?? '-'}
              </span>
              <span className={`w-7 h-7 border border-gray-200 rounded flex items-center justify-center text-sm font-black ${isLive ? 'text-yellow-500' : 'text-gray-900'}`}>
                {fixture.score?.away ?? '-'}
              </span>
            </div>
            <span className="text-gray-400 text-[10px] font-semibold mt-0.5">
              {isLive ? `${fixture.status?.elapsed}'` : 'FT'}
            </span>
          </>
        )}
      </div>

      <div className="w-9 h-9 shrink-0">
        <TeamLogo name={fixture.awayTeam?.name} logo={fixture.awayTeam?.logo} className="w-9 h-9" />
      </div>
    </Link>
  )
}

// ─── Competition block ───────────────────────────────────────────
function CompetitionBlock({ group }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-5">
      {/* Competition header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <LeagueLogo slug={group.league?.slug} name={group.league?.name} logo={group.league?.logo} className="w-6 h-6" />
          <span className="text-sm font-black text-gray-800">
            {group.league?.name || 'Competition'}
          </span>
          <span className="text-gray-400 text-sm">›</span>
        </div>
        <Link
          to={`/${findSportForLeague(group.league?.slug)}?tab=table&league=${group.league?.slug || ''}`}
          onClick={e => e.stopPropagation()}
          className="text-primary text-xs font-bold hover:underline"
        >
          View table ›
        </Link>
      </div>

      {/* Round label */}
      {group.fixtures[0]?.round && (
        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
          <span className="text-gray-500 text-xs font-medium">{group.fixtures[0].round}</span>
        </div>
      )}

      {/* Fixtures — 2 per row desktop, 1 per row mobile */}
      <FixturePairs fixtures={group.fixtures} />
    </div>
  )
}

// ─── Date slider ─────────────────────────────────────────────────
function DateSlider({ selected, onSelect }) {
  const today   = startOfDay(new Date())
  const anchor  = startOfDay(selected)
  const days    = buildDays(anchor)
  const scrollRef = useRef(null)

  // Keep selected day in view
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const active = el.querySelector('[data-selected="true"]')
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [selected])

  const monthLabel = selected.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      {/* Month row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => { const d = new Date(selected); d.setDate(d.getDate() - 7); onSelect(startOfDay(d)) }}
          className="text-gray-400 hover:text-dark transition-colors text-xl leading-none px-2"
        >‹</button>

        <span className="text-sm font-black text-gray-700">{monthLabel}</span>

        <button
          onClick={() => { const d = new Date(selected); d.setDate(d.getDate() + 7); onSelect(startOfDay(d)) }}
          className="text-primary hover:text-yellow-500 transition-colors text-xl leading-none px-2 font-bold"
        >›</button>
      </div>

      {/* Day strip — centered, scrollable */}
      <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide py-2 px-2 gap-1 justify-start">
        {days.map((d, i) => {
          const isSelected = isSameDay(d, selected)
          const isToday    = isSameDay(d, today)
          const { weekday, date, month } = formatSliderDay(d)
          return (
            <button
              key={i}
              data-selected={isSelected ? 'true' : undefined}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-center justify-center px-2.5 py-2 rounded-lg shrink-0 min-w-[52px] transition-all ${
                isSelected
                  ? 'bg-primary text-dark'
                  : isToday
                  ? 'bg-gray-100 text-gray-800 font-bold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase leading-tight">{weekday}</span>
              <span className="text-base font-black leading-tight">{date}</span>
              <span className="text-[10px] leading-tight opacity-70">{month}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────
export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams()

  const today = startOfDay(new Date())

  // sport comes from URL param — set by the navbar sub-nav links
  const initSport  = searchParams.get('sport') || 'football'
  const initLeague = searchParams.get('league') || ''

  const [activeSport,  setActiveSport]  = useState(initSport)
  const [activeLeague, setActiveLeague] = useState(initLeague)
  const [selectedDate, setSelectedDate] = useState(today)
  const [fixtures,     setFixtures]     = useState([])
  const [loading,      setLoading]      = useState(true)

  const leagues = SPORT_LEAGUES[activeSport] || SPORT_LEAGUES.football

  // When sport changes reset league
  useEffect(() => {
    const first = (SPORT_LEAGUES[activeSport] || [])[0]?.slug || ''
    setActiveLeague(first)
  }, [activeSport])

  // Sync sport from URL (so navbar sub-nav links work)
  useEffect(() => {
    const s = searchParams.get('sport') || searchParams.get('league') || ''
    if (s) {
      // if it looks like a league slug map to sport
      const sport = Object.entries(SPORT_LEAGUES).find(([, ls]) =>
        ls.some(l => l.slug === s)
      )
      if (sport) {
        setActiveSport(sport[0])
        setActiveLeague(s)
      } else if (SPORT_LEAGUES[s]) {
        setActiveSport(s)
      }
    }
  }, [])

  // Fetch
  useEffect(() => {
    if (!activeLeague) return
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

    setSearchParams({ sport: activeSport, league: activeLeague })
  }, [activeLeague, activeSport, selectedDate])

  const groups    = groupByCompetition(fixtures)
  const dateLabel = formatGroupDate(selectedDate)

  return (
    <>
      <Helmet>
        <title>Scores & Fixtures — Ten Sports</title>
        <meta name="description" content="Live scores, fixtures and results across all sports." />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">

        <h1 className="text-dark font-black text-2xl mb-6">Scores & Fixtures</h1>

        {/* Date slider — centered, full width */}
        <DateSlider selected={selectedDate} onSelect={setSelectedDate} />

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : fixtures.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <p className="text-gray-600 font-black text-lg">{dateLabel}</p>
            <p className="text-gray-400 text-sm mt-2">No fixtures scheduled for this date.</p>
            <p className="text-gray-300 text-xs mt-1">Try a different date.</p>
          </div>
        ) : (
          <>
            <h2 className="text-gray-800 font-black text-lg mb-4">{dateLabel}</h2>
            {groups.map((group, i) => (
              <CompetitionBlock key={i} group={group} />
            ))}
          </>
        )}
      </div>
    </>
  )
}