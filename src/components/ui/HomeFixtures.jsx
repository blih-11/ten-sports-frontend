import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getFixtures } from '../../utils/api'
import TeamLogo from './TeamLogo'
import LeagueLogo from './LeagueLogo'

function StatusTag({ status }) {
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(status?.short)
  if (isLive) return <span className="text-primary font-black text-[10px] animate-pulse">{status.elapsed}'</span>
  if (status?.short === 'FT') return <span className="text-gray-500 text-[10px] font-semibold">FT</span>
  return null
}

export default function HomeFixtures() {
  const [fixtures, setFixtures] = useState([])
  const [leagueInfo, setLeagueInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFixtures({ status: 'finished', limit: 20 })
      .then(res => {
        const sorted = [...(res.data.data || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
        const top = sorted.slice(0, 6)
        setFixtures(top)
        setLeagueInfo(top[0]?.league || null)
      })
      .catch(() => setFixtures([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && fixtures.length === 0) return null

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-t-4 border-dark pt-3 mb-6">
        <h2 className="text-dark font-black text-lg uppercase tracking-wide">Match Results</h2>
        <Link to="/results" className="text-primary text-sm font-semibold hover:underline">See all →</Link>
      </div>

      <div className="bg-dark -mx-4 sm:-mx-6 lg:mx-0 rounded-none lg:rounded-xl overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-surface rounded animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* League shown once, not repeated per row */}
            {leagueInfo && (
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 shrink-0">
                <LeagueLogo slug={leagueInfo.slug} name={leagueInfo.name} logo={leagueInfo.logo} className="w-4 h-4" />
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{leagueInfo.name}</span>
              </div>
            )}

            <div className="flex-1 flex flex-col divide-y divide-gray-800">
              {fixtures.map(f => (
                <Link
                  key={f._id}
                  to={`/match/${f._id}`}
                  className="group flex-1 flex flex-col justify-center px-4 hover:bg-surface/50 transition-colors min-h-0"
                >
                  <div className="flex items-center justify-end mb-1">
                    <StatusTag status={f.status} />
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                      <span className={`truncate text-right ${f.score?.home > f.score?.away ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                        {f.homeTeam?.name}
                      </span>
                      <TeamLogo name={f.homeTeam?.name} logo={f.homeTeam?.logo} className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1 px-1 shrink-0 font-black text-white">
                      <span>{f.score?.home ?? '-'}</span>
                      <span className="text-gray-600">-</span>
                      <span>{f.score?.away ?? '-'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <TeamLogo name={f.awayTeam?.name} logo={f.awayTeam?.logo} className="w-5 h-5" />
                      <span className={`truncate ${f.score?.away > f.score?.home ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                        {f.awayTeam?.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}