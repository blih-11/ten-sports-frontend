import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStandings } from '../../utils/api'
import TeamLogo from './TeamLogo'

function MiniTable({ slug, name }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
  getStandings(slug)
    .then(res => {
      console.log('standings response:', res.data)
      setRows(res.data.data?.slice(0, 5) || [])
    })
    .catch((err) => {
      console.error('standings error:', err.response?.data || err.message)
      setRows([])
    })
    .finally(() => setLoading(false))
}, [slug])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400">{name}</h3>
        <Link to={`/football?tab=table&league=${slug}`} className="text-xs text-gray-400 hover:text-yellow-400 transition-colors">Full table →</Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-gray-500 text-xs py-2">No data yet — sync needed</p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-700">
              <th className="text-left pb-1 w-5">#</th>
              <th className="text-left pb-1">Team</th>
              <th className="text-center pb-1 w-6">P</th>
              <th className="text-center pb-1 w-6">GD</th>
              <th className="text-center pb-1 w-6 text-yellow-400">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row._id} className={`border-b border-gray-800 ${i === 0 ? 'text-yellow-400' : 'text-gray-300'}`}>
                <td className="py-1.5 text-gray-500">{row.rank}</td>
                <td className="py-1.5">
                  <div className="flex items-center gap-1.5">
                    <TeamLogo name={row.team.name} logo={row.team.logo} className="w-4 h-4" />
                    <span className="font-medium truncate max-w-[80px]">{row.team.name}</span>
                  </div>
                </td>
                <td className="py-1.5 text-center text-gray-400">{row.played}</td>
                <td className="py-1.5 text-center text-gray-400">{row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</td>
                <td className="py-1.5 text-center font-bold">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function LeagueTableWidget() {
  return (
    <div className="bg-black rounded-xl p-4 h-full flex flex-col gap-6">
      <MiniTable slug="premier-league" name="Premier League" />
      <div className="border-t border-gray-700" />
      <MiniTable slug="la-liga" name="La Liga" />
    </div>
  )
}