import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getFixtures } from '../../utils/api'
import TeamLogo from './TeamLogo'
import LeagueLogo from './LeagueLogo'

// Maps a category slug to the league whose fixtures should show.
// Categories with no mapping (tennis, athletics, etc.) simply render nothing,
// since there's no fixture data for those sports yet.
const CATEGORY_LEAGUE_MAP = {
  football: 'premier-league',
  nba: 'nba',
}

export default function CategoryUpcomingMatches({ categorySlug }) {
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true)

  const leagueSlug = CATEGORY_LEAGUE_MAP[categorySlug]

  useEffect(() => {
    if (!leagueSlug) { setLoading(false); return }
    setLoading(true)
    getFixtures({ leagueSlug, status: 'upcoming', limit: 8 })
      .then(res => setFixtures(res.data.data || []))
      .catch(() => setFixtures([]))
      .finally(() => setLoading(false))
  }, [leagueSlug])

  if (!leagueSlug) return null
  if (!loading && fixtures.length === 0) return null

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between border-t-4 border-dark pt-3 mb-6">
        <h2 className="text-dark font-black text-lg uppercase tracking-wide">Upcoming Matches</h2>
        <Link to={`/results?league=${leagueSlug}`} className="text-primary text-sm font-semibold hover:underline">See all →</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-56 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fixtures.map(f => (
            <Link key={f._id} to={`/match/${f._id}`} className="group bg-dark rounded-xl p-5 flex flex-col hover:bg-surface transition-colors">
              <span className="flex items-center gap-1.5 mb-4">
                <LeagueLogo slug={f.league?.slug} name={f.league?.name} className="w-4 h-4" />
                <span className="text-primary text-xs font-bold uppercase tracking-wide">{f.league?.name}</span>
              </span>

              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="flex flex-col items-center w-20 min-w-0">
                  <TeamLogo name={f.homeTeam?.name} className="w-12 h-12 mb-2" />
                  <span className="text-white font-bold text-[11px] leading-snug text-center truncate w-full">{f.homeTeam?.name}</span>
                </div>

                <span className="text-gray-500 text-xs font-semibold shrink-0 mb-6">vs</span>

                <div className="flex flex-col items-center w-20 min-w-0">
                  <TeamLogo name={f.awayTeam?.name} className="w-12 h-12 mb-2" />
                  <span className="text-white font-bold text-[11px] leading-snug text-center truncate w-full">{f.awayTeam?.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
                <span className="text-gray-400 text-xs font-medium">
                  {new Date(f.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}, {new Date(f.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <span className="text-primary text-xs font-bold group-hover:underline whitespace-nowrap">
                  Match Details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}