import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../utils/api'
import TeamLogo from '../components/ui/TeamLogo'
import LeagueLogo from '../components/ui/LeagueLogo'

const FOOTBALL_LEAGUES = [
  { slug: 'premier-league',    name: 'Premier League' },
  { slug: 'championship',      name: 'Championship' },
  { slug: 'league-one',        name: 'League One' },
  { slug: 'league-two',        name: 'League Two' },
  { slug: 'champions-league',  name: 'Champions League' },
  { slug: 'europa-league',     name: 'Europa League' },
  { slug: 'la-liga',           name: 'La Liga' },
  { slug: 'serie-a',           name: 'Serie A' },
  { slug: 'bundesliga',        name: 'Bundesliga' },
  { slug: 'ligue-1',           name: 'Ligue 1' },
]

function FormBadge({ char }) {
  const colors = {
    W: 'bg-green-500', D: 'bg-yellow-500', L: 'bg-red-500',
  }
  return (
    <span className={`inline-block w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center ${colors[char] || 'bg-gray-600'}`}>
      {char}
    </span>
  )
}

export default function Tables() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialLeague = searchParams.get('league') || 'premier-league'

  const [activeLeague, setActiveLeague] = useState(initialLeague)
  const [standings, setStandings] = useState([])
  const [leagueInfo, setLeagueInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/standings', { params: { leagueSlug: activeLeague } })
      .then(res => {
        setStandings(res.data.data || [])
        setLeagueInfo(res.data.league || null)
      })
      .catch(() => setStandings([]))
      .finally(() => setLoading(false))
    setSearchParams({ league: activeLeague })
  }, [activeLeague])

  const handleLeagueClick = (slug) => {
    setActiveLeague(slug)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Helmet>
        <title>League Tables — Ten Sports</title>
        <meta name="description" content="Football league tables and standings — Premier League, La Liga, Serie A and more." />
      </Helmet>

       

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar league picker */}
          <aside className="lg:w-56 shrink-0">
            <div className="bg-dark rounded-xl overflow-hidden sticky top-24">
              <div className="px-4 py-3 border-b border-gray-800">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Competitions</h2>
              </div>
              <nav className="p-2">
                {FOOTBALL_LEAGUES.map(l => (
                  <button
                    key={l.slug}
                    onClick={() => handleLeagueClick(l.slug)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      activeLeague === l.slug
                        ? 'bg-primary text-dark font-bold'
                        : 'text-gray-400 hover:bg-surface hover:text-white'
                    }`}
                  >
                    <LeagueLogo slug={l.slug} name={l.name} logo={l.logo} className="w-5 h-5 shrink-0" />
                    <span className="truncate">{l.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main table */}
          <div className="flex-1 min-w-0">
            <div className="bg-dark rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LeagueLogo slug={activeLeague} name={leagueInfo?.name} logo={leagueInfo?.logo} className="w-8 h-8" />
                  <h2 className="text-white font-black text-lg">
                    {FOOTBALL_LEAGUES.find(l => l.slug === activeLeague)?.name || activeLeague}
                  </h2>
                </div>
                <span className="text-gray-500 text-xs">2025/26</span>
              </div>

              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-10 bg-surface rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : standings.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-sm">No standings data available yet.</p>
                  <p className="text-gray-600 text-xs mt-1">Data syncs daily — check back soon.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-gray-800">
                        <th className="text-left px-4 py-3 w-8">#</th>
                        <th className="text-left px-4 py-3">Club</th>
                        <th className="text-center px-3 py-3 w-10">MP</th>
                        <th className="text-center px-3 py-3 w-10">W</th>
                        <th className="text-center px-3 py-3 w-10">D</th>
                        <th className="text-center px-3 py-3 w-10">L</th>
                        <th className="text-center px-3 py-3 w-10">GF</th>
                        <th className="text-center px-3 py-3 w-10">GA</th>
                        <th className="text-center px-3 py-3 w-10">GD</th>
                        <th className="text-center px-3 py-3 w-12 text-primary font-bold">Pts</th>
                        <th className="text-center px-3 py-3 hidden md:table-cell">Form</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row, i) => {
                        const isTop4 = i < 4
                        const isEuropa = i >= 4 && i < 6
                        const isRelegation = i >= standings.length - 3

                        return (
                          <tr
                            key={row._id}
                            className={`border-b border-gray-800/50 hover:bg-surface/50 transition-colors ${
                              i === 0 ? 'bg-primary/5' : ''
                            }`}
                          >
                            <td className="px-4 py-3 relative">
                              {isTop4 && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />}
                              {isEuropa && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r" />}
                              {isRelegation && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r" />}
                              <span className={`text-sm ${i === 0 ? 'text-primary font-bold' : 'text-gray-500'}`}>{row.rank}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <TeamLogo name={row.team?.name} logo={row.team?.logo} className="w-6 h-6" />
                                <span className={`font-semibold truncate ${i === 0 ? 'text-primary' : 'text-white'}`}>
                                  {row.team?.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center text-gray-400">{row.played}</td>
                            <td className="px-3 py-3 text-center text-gray-400">{row.won}</td>
                            <td className="px-3 py-3 text-center text-gray-400">{row.drawn}</td>
                            <td className="px-3 py-3 text-center text-gray-400">{row.lost}</td>
                            <td className="px-3 py-3 text-center text-gray-400">{row.goalsFor}</td>
                            <td className="px-3 py-3 text-center text-gray-400">{row.goalsAgainst}</td>
                            <td className="px-3 py-3 text-center text-gray-400">
                              {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                            </td>
                            <td className="px-3 py-3 text-center font-black text-white text-base">{row.points}</td>
                            <td className="px-3 py-3 hidden md:table-cell">
                              <div className="flex items-center justify-center gap-0.5">
                                {(row.form || '').split('').slice(-5).map((char, fi) => (
                                  <FormBadge key={fi} char={char} />
                                ))}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  <div className="px-4 py-3 border-t border-gray-800 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-500 rounded" /> Champions League</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-orange-500 rounded" /> Europa League</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded" /> Relegation</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}