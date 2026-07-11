import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getArticles, getStandings, timeAgo } from '../../utils/api'
import { CardThumb } from './ArticleCard'
import SidebarStandings from './SidebarStandings'
import TableTab from './TableTab'


const LEAGUE_MAP = {
  football: 'premier-league',
  nba: 'nba',
}

function FormDot({ char }) {
  const colors = { W: 'bg-green-500', D: 'bg-yellow-400', L: 'bg-red-500' }
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[char] || 'bg-gray-400'}`} />
}

export default function CategorySidebar({ categorySlug, excludeIds = [] }) {
  const [standings, setStandings] = useState([])
  const [standingsLoading, setStandingsLoading] = useState(true)
  const [recent, setRecent] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)
  const leagueSlug = LEAGUE_MAP[categorySlug]

  useEffect(() => {
    if (!leagueSlug) { setStandingsLoading(false); return }
    getStandings(leagueSlug)
      .then(res => setStandings(res.data.data || []))
      .catch(() => setStandings([]))
      .finally(() => setStandingsLoading(false))
  }, [leagueSlug])

  useEffect(() => {
    getArticles({ limit: 8 })
      .then(res => {
        const data = res.data.data || []
        setRecent(data.filter(a => !excludeIds.includes(a._id)).slice(0, 6))
      })
      .catch(console.error)
      .finally(() => setRecentLoading(false))
  }, [excludeIds.join(',')])

  return (
    <aside className="space-y-8">

      {/* Mini Standings */}
      {categorySlug === 'football'
        ? <TableTab sport={categorySlug} compact />
        : <SidebarStandings categorySlug={categorySlug} />
      }

      {/* Recent Articles */}
      <div>
        <h3 className="font-black text-dark text-sm uppercase tracking-widest mb-3 border-t-4 border-dark pt-3">More News</h3>
        {recentLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-20 h-14 rounded-lg bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map(a => (
              <Link key={a._id} to={`/article/${a.slug}`} className="group flex gap-3 py-3 hover:opacity-80 transition-opacity">
                <div className="w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <CardThumb article={a} className="w-full h-full object-cover" placeholderClass="w-full h-full bg-gray-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 text-xs font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h4>
                  <p className="text-gray-400 text-[10px] mt-1">{timeAgo(a.publishedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Ad slot */}
      <div className="bg-gray-100 rounded-xl h-60 flex items-center justify-center text-gray-400 text-xs font-medium uppercase tracking-widest">
        Advertisement
      </div>

    </aside>
  )
}