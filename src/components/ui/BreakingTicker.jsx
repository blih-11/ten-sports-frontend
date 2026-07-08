import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../../utils/api'

export default function BreakingTicker() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    getArticles({ breaking: true, limit: 5 })
      .then(res => setArticles(res.data.data || []))
      .catch(() => {})
  }, [])

  if (!articles.length) return null

  return (
    <div className="bg-primary text-dark py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <span className="bg-dark text-primary text-xs font-black px-3 py-1 rounded flex-shrink-0 uppercase tracking-widest">Breaking</span>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {[...articles, ...articles].map((a, i) => (
              <Link key={i} to={`/article/${a.slug}`} className="text-sm font-semibold hover:underline flex-shrink-0">
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
