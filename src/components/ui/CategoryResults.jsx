import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFixtures } from '../../utils/api'
import TeamLogo from './TeamLogo'
import LeagueLogo from './LeagueLogo'

const CATEGORY_LEAGUE_MAP = {
  football: 'premier-league',
  nba: 'nba',
}

const FOOTBALL_LEAGUES = [
  { slug: 'premier-league',   name: 'Premier League' },
  { slug: 'championship',     name: 'Championship' },
  { slug: 'champions-league', name: 'UCL' },
  { slug: 'europa-league',    name: 'UEL' },
  { slug: 'la-liga',          name: 'La Liga' },
  { slug: 'serie-a',          name: 'Serie A' },
  { slug: 'bundesliga',       name: 'Bundesliga' },
  { slug: 'ligue-1',          name: 'Ligue 1' },
]

const BASKETBALL_LEAGUES = [
  { slug: 'nba', name: 'NBA' },
]

function formatGroupDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

function groupByDate(fixtures) {
  const groups = {}
  for (const f of fixtures) {
    const key = new Date(f.date).toDateString()
    if (!groups[key]) groups[key] = { label: formatGroupDate(f.date), fixtures: [] }
    groups[key].fixtures.push(f)
  }
  return Object.values(groups)
}

function FixtureRow({ fixture }) {
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixture.status?.short)
  const isFinished = fixture.status?.short === 'FT'

  const homeWin = isFinished && fixture.score?.home > fixture.score?.away
  const awayWin = isFinished && fixture.score?.away > fixture.score?.home

  const badge = fixture.round
    ? fixture.round.replace('Regular Season - ', 'R').replace('Group Stage - ', 'GS').slice(0, 6)
    : fixture.league?.name?.slice(0, 2).toUpperCase() || 'LC'

  return (
    <Link
      to={`/match/${fixture._id}`}
      className="group flex items-center border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
    >
      {/* ── MOBILE layout ── */}
      <div className="flex md:hidden w-full items-center gap-2 px-3 py-3">
        {/* Competition logo */}
        <div className="w-4 h-4 shrink-0">
          <LeagueLogo slug={fixture.league?.slug} name={fixture.league?.name} className="w-4 h-4" />
        </div>

        {/* Home name */}
        <span className={`flex-1 text-sm font-bold truncate ${homeWin ? 'text-gray-900' : 'text-gray-500'}`}>
          {fixture.homeTeam?.name}
        </span>

        {/* Score boxes */}
        <div className="flex items-center gap-0.5 shrink-0">
          <span className={`w-7 h-7 border border-gray-300 flex items-center justify-center text-xs font-black rounded ${isLive ? 'text-yellow-500 border-yellow-400' : 'text-gray-900'}`}>
            {fixture.score?.home ?? '-'}
          </span>
          <span className={`w-7 h-7 border border-gray-300 flex items-center justify-center text-xs font-black rounded ${isLive ? 'text-yellow-500 border-yellow-400' : 'text-gray-900'}`}>
            {fixture.score?.away ?? '-'}
          </span>
        </div>

        {/* Away name */}
        <span className={`flex-1 text-sm font-bold truncate text-right ${awayWin ? 'text-gray-900' : 'text-gray-500'}`}>
          {fixture.awayTeam?.name}
        </span>

        {/* FT / live */}
        <span className="w-6 shrink-0 text-right">
          {isLive
            ? <span className="text-yellow-500 text-[10px] font-black">{fixture.status?.elapsed}'</span>
            : isFinished
            ? <span className="text-gray-400 text-[10px] font-semibold">FT</span>
            : null}
        </span>
      </div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden md:flex w-full items-center gap-3 px-5 py-4">
        {/* Competition logo */}
        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
          <LeagueLogo slug={fixture.league?.slug} name={fixture.league?.name} className="w-5 h-5" />
        </div>

        {/* Home logo */}
        <div className="w-8 h-8 shrink-0 flex items-center justify-center">
          <TeamLogo name={fixture.homeTeam?.name} className="w-8 h-8" />
        </div>

        {/* Home name right-aligned */}
        <span className={`flex-1 text-right text-sm font-bold truncate pr-2 ${homeWin ? 'text-gray-900' : 'text-gray-500'}`}>
          {fixture.homeTeam?.name}
        </span>

        {/* Score boxes */}
        <div className="flex items-center gap-1 shrink-0">
          <span className={`w-8 h-8 border border-gray-300 rounded flex items-center justify-center text-sm font-black ${isLive ? 'text-yellow-500 border-yellow-400' : 'text-gray-900'}`}>
            {fixture.score?.home ?? '-'}
          </span>
          <span className={`w-8 h-8 border border-gray-300 rounded flex items-center justify-center text-sm font-black ${isLive ? 'text-yellow-500 border-yellow-400' : 'text-gray-900'}`}>
            {fixture.score?.away ?? '-'}
          </span>
        </div>

        {/* Away name left-aligned */}
        <span className={`flex-1 text-left text-sm font-bold truncate pl-2 ${awayWin ? 'text-gray-900' : 'text-gray-500'}`}>
          {fixture.awayTeam?.name}
        </span>

        {/* Away logo */}
        <div className="w-8 h-8 shrink-0 flex items-center justify-center">
          <TeamLogo name={fixture.awayTeam?.name} className="w-8 h-8" />
        </div>

        {/* FT / live */}
        <div className="w-8 shrink-0 text-right">
          {isLive
            ? <span className="text-yellow-500 text-xs font-black animate-pulse">{fixture.status?.elapsed}'</span>
            : isFinished
            ? <span className="text-gray-400 text-xs font-semibold">FT</span>
            : null}
        </div>
      </div>
    </Link>
  )
}

export default function CategoryResults({ categorySlug }) {
  const defaultLeague = CATEGORY_LEAGUE_MAP[categorySlug]
  const leagues = categorySlug === 'nba' ? BASKETBALL_LEAGUES : FOOTBALL_LEAGUES

  const [activeLeague, setActiveLeague] = useState(defaultLeague)
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveLeague(CATEGORY_LEAGUE_MAP[categorySlug])
  }, [categorySlug])

  useEffect(() => {
    if (!activeLeague) { setLoading(false); return }
    setLoading(true)
    getFixtures({ leagueSlug: activeLeague, status: 'finished', limit: 20 })
      .then(res => setFixtures(res.data.data || []))
      .catch(() => setFixtures([]))
      .finally(() => setLoading(false))
  }, [activeLeague])

  if (!defaultLeague) return null

  const groups = groupByDate(fixtures)

  return (
    <div className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between border-t-4 border-dark pt-3 mb-4">
        <h2 className="text-dark font-black text-lg uppercase tracking-wide">Results & Fixtures</h2>
        <Link
          to={`/${categorySlug}?tab=results`}
          className="text-primary text-sm font-semibold hover:underline"
        >
          See all →
        </Link>
      </div>

      {/* White card */}
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">

        {/* League tabs — football only */}
        {leagues.length > 1 && (
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex px-3 pt-2 gap-1 min-w-max">
              {leagues.map(l => (
                <button
                  key={l.slug}
                  onClick={() => setActiveLeague(l.slug)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-lg whitespace-nowrap transition-all border-b-2 ${
                    activeLeague === l.slug
                      ? 'border-yellow-400 text-gray-900 bg-yellow-50'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <LeagueLogo slug={l.slug} name={l.name} className="w-4 h-4" />
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : fixtures.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-gray-400 text-sm font-semibold">No results found.</p>
            <p className="text-gray-300 text-xs mt-1">Data syncs daily — check back soon.</p>
          </div>
        ) : (
          <>
            {groups.map((group, gi) => (
              <div key={gi}>
                {/* Date header — centered, italic-ish, light */}
                <div className="py-2.5 border-b border-gray-100">
                  <p className="text-center text-gray-500 text-xs font-medium">{group.label}</p>
                </div>
                {group.fixtures.map(f => <FixtureRow key={f._id} fixture={f} />)}
              </div>
            ))}

            {/* Full table button */}
            <div className="border-t border-gray-200 px-5 py-4 flex justify-end">
              <Link
                to={`/${categorySlug}?tab=table&league=${activeLeague}`}
                className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
              >
                Full Table <span>›</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}