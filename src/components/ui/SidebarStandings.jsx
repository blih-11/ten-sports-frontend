import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStandings } from '../../utils/api'
import TeamLogo from './TeamLogo'

const LEAGUE_MAP = {
  football:   { slug: 'premier-league', name: 'Premier League', season: '2026/2027' },
  nba:        { slug: 'nba',            name: 'NBA',            season: '2026/2027' },
}

// Generic pool of plausible club names used to fill a placeholder table
// for any league that doesn't have synced standings yet. If the team
// whose page we're on isn't in this generic pool (most won't be), it's
// injected in as row 1 so the highlight always has something to show.
const GENERIC_CLUB_POOL = [
  'Northgate United', 'Riverside Athletic', 'Ashford Town', 'Kingsmoor FC',
  'Whitfield Rovers', 'Sundale City', 'Ellwood Park', 'Marchvale United',
  'Brookfield Albion', 'Castlemere FC', 'Oldbury Wanderers', 'Fenwick Town',
  'Harrowgate Rangers', 'Stonebridge United', 'Millhaven FC', 'Draycott City',
  'Wexbridge Athletic', 'Norcombe United', 'Aldergate FC', 'Redshaw Town',
]

function buildDefaultStandings(league, highlightTeamName) {
  const names = highlightTeamName
    ? [highlightTeamName, ...GENERIC_CLUB_POOL.filter(n => n !== highlightTeamName)]
    : GENERIC_CLUB_POOL

  return names.slice(0, 20).map((name, i) => {
    const played = 30
    const won = Math.max(2, 22 - i * 1.1)
    const drawn = Math.max(1, 6 - Math.floor(i / 4))
    const lost = played - Math.round(won) - drawn
    const goalsFor = Math.max(15, 80 - i * 3)
    const goalsAgainst = 20 + i * 2
    return {
      _id: `mock-standing-${league.slug}-${i}`,
      rank: i + 1,
      team: { name, logo: '' },
      played,
      won: Math.round(won),
      drawn,
      lost: Math.max(0, lost),
      goalsFor,
      goalsAgainst,
      goalDiff: goalsFor - goalsAgainst,
      points: Math.round(won) * 3 + drawn,
      form: 'WWDLW',
    }
  })
}

export default function SidebarStandings({ categorySlug, showFull = false, league: leagueOverride, onPrev, onNext, highlightTeamName }) {
  const [standings, setStandings] = useState([])
  const [loading, setLoading]     = useState(true)

  // A league passed in explicitly (e.g. from the Table tab's switcher)
  // takes priority over the hardcoded default for this category.
  const league = leagueOverride || LEAGUE_MAP[categorySlug]

  useEffect(() => {
    if (!league) { setLoading(false); return }
    setLoading(true)
    getStandings(league.slug)
      .then(res => {
        const data = res.data.data || []
        setStandings(data.length > 0 ? data : buildDefaultStandings(league, highlightTeamName))
      })
      .catch(() => setStandings(buildDefaultStandings(league, highlightTeamName)))
      .finally(() => setLoading(false))
  }, [league?.slug])

  if (!league) return null

  const rows = showFull ? standings : standings.slice(0, 10)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden w-full">

      {/* Header */}
      <div className="bg-dark px-3 py-3 flex items-center justify-between gap-2">
        {onPrev ? (
          <button
            onClick={onPrev}
            aria-label="Previous league"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-primary hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : <span className="w-7 shrink-0" />}

        <h3 className="text-white font-black text-sm tracking-wide text-center flex-1 truncate">
          {league.name}{league.season ? ` — ${league.season}` : ''}
        </h3>

        {onNext ? (
          <button
            onClick={onNext}
            aria-label="Next league"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-primary hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : <span className="w-7 shrink-0" />}
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-4 space-y-2 bg-white">
          {[...Array(showFull ? 20 : 6)].map((_, i) => (
            <div key={i} className="h-7 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left py-2.5 px-3 font-bold text-gray-600 w-8">Pos</th>
              <th className="text-left py-2.5 font-bold text-gray-600">Team</th>
              <th className="text-center py-2.5 px-2 font-bold text-gray-600">Pld</th>
              <th className="text-center py-2.5 px-2 font-bold text-gray-600">GD</th>
              <th className="text-center py-2.5 px-3 font-bold text-gray-600">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, idx) => {
              const isHighlighted = highlightTeamName && s.team?.name?.toLowerCase() === highlightTeamName.toLowerCase()
              return (
                <tr
                  key={s._id}
                  className={`border-b border-gray-100 last:border-0 transition-colors ${
                    isHighlighted
                      ? 'bg-primary/15 hover:bg-primary/20'
                      : `hover:bg-yellow-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`
                  }`}
                  style={isHighlighted ? { boxShadow: 'inset 3px 0 0 0 #FFD600' } : undefined}
                >
                  <td className={`py-2.5 px-3 font-semibold ${isHighlighted ? 'text-dark font-black' : 'text-gray-500'}`}>{s.rank}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <TeamLogo name={s.team?.name} logo={s.team?.logo} className="w-4 h-4" />
                      <span className={`truncate ${isHighlighted ? 'text-dark font-black' : 'text-primary font-medium hover:underline cursor-pointer'}`}>
                        {s.team?.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-gray-600">{s.played ?? 0}</td>
                  <td className="py-2.5 px-2 text-center text-gray-600">
                    {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff ?? 0}
                  </td>
                  <td className={`py-2.5 px-3 text-center font-black ${isHighlighted ? 'text-dark' : 'text-gray-900'}`}>{s.points ?? 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* Full table link — only shown in sidebar (not showFull mode) */}
      {!showFull && (
        <div className="bg-dark border-t border-gray-800 px-4 py-2.5 text-center">
          <Link
            to={`/${categorySlug}?tab=table&league=${league.slug}`}
            className="text-primary text-xs font-semibold hover:underline"
          >
            Full {league.name} Table →
          </Link>
        </div>
      )}
    </div>
  )
}