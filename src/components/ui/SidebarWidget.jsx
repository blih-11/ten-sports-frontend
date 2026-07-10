import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getArticles, timeAgo, cardImage } from '../../utils/api'
import { HorizontalSkeleton } from './Skeleton'

export default function SidebarWidget({ title = 'Trending Now', category = '', limit = 5 }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = { limit }
    if (category) params.category = category
    getArticles(params)
      .then(res => setArticles(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div>
      <div className="border-t-4 border-dark pt-3 mb-4">
        <h3 className="font-black text-dark uppercase tracking-wide text-sm">{title}</h3>
      </div>
      <div className="space-y-4">
        {loading
          ? [...Array(limit)].map((_, i) => <HorizontalSkeleton key={i} />)
          : articles.map((article) => (
            <Link key={article._id} to={`/article/${article.slug}`} className="group flex gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {cardImage(article)
                  ? <img src={cardImage(article)} alt={article.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gray-200" />
                }
              </div>
              <div>
                <span className="text-primary text-xs font-bold uppercase">{article.category?.name}</span>
                <h4 className="text-gray-900 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h4>
                <span className="text-gray-400 text-xs">{timeAgo(article.publishedAt)}</span>
              </div>
            </Link>
          ))
        }
      </div>
    </div>
  )
}