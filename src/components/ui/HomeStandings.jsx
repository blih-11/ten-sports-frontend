import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getStandings } from '../../utils/api'
import TeamLogo from './TeamLogo'
import LeagueLogo from './LeagueLogo'

const DEFAULT_LEAGUE = 'premier-league'

function FormBadge({ char }) {
  const colors = { W: 'bg-green-500', D: 'bg-yellow-500', L: 'bg-red-500' }
  return (
    <span className={`inline-block w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center ${colors[char] || 'bg-gray-600'}`}>
      {char}
    </span>
  )
}

export default function HomeStandings() {
  const [standings, setStandings] = useState([])
  const [leagueInfo, setLeagueInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStandings(DEFAULT_LEAGUE)
      .then(res => {
        setStandings(res.data.data || [])
        setLeagueInfo(res.data.league || null)
      })
      .catch(() => setStandings([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && standings.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between border-t-4 border-dark pt-3 mb-6">
        <h2 className="text-dark font-black text-lg uppercase tracking-wide flex items-center gap-2">
          <LeagueLogo slug={DEFAULT_LEAGUE} name={leagueInfo?.name} className="w-5 h-5" />
          Standings{leagueInfo?.name ? ` — ${leagueInfo.name}` : ''}
        </h2>
        <Link to={`/football?tab=table&league=${DEFAULT_LEAGUE}`} className="text-primary text-sm font-semibold hover:underline">Full table →</Link>
      </div>

      <div className="bg-dark -mx-4 sm:-mx-6 lg:mx-0 rounded-none lg:rounded-xl overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-6 bg-surface rounded animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                <th className="text-left font-semibold py-3 px-4 w-8">#</th>
                <th className="text-left font-semibold py-3">Team</th>
                <th className="text-center font-semibold py-3 px-2">P</th>
                <th className="text-center font-semibold py-3 px-2">W</th>
                <th className="text-center font-semibold py-3 px-2">D</th>
                <th className="text-center font-semibold py-3 px-2">L</th>
                <th className="text-center font-semibold py-3 px-2">GD</th>
                <th className="text-center font-semibold py-3 px-2">Pts</th>
                <th className="text-right font-semibold py-3 px-4">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.slice(0, 8).map(s => (
                <tr key={s._id} className="border-b border-gray-800/60 last:border-0 hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-4 text-gray-400 font-semibold">{s.rank}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <TeamLogo name={s.team?.name} />
                      <span className="text-white font-semibold truncate">{s.team?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center text-gray-300">{s.played}</td>
                  <td className="py-3 px-2 text-center text-gray-300">{s.won}</td>
                  <td className="py-3 px-2 text-center text-gray-300">{s.drawn}</td>
                  <td className="py-3 px-2 text-center text-gray-300">{s.lost}</td>
                  <td className="py-3 px-2 text-center text-gray-300">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                  <td className="py-3 px-2 text-center text-primary font-black">{s.points}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      {(s.form || '').slice(-5).split('').map((c, i) => <FormBadge key={i} char={c} />)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}