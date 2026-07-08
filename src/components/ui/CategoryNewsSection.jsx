import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getArticles } from '../../utils/api'
import ArticleCard from './ArticleCard'

export default function CategoryNewsSection({ category, limit = 6, title }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!category?._id) return
    setLoading(true)
    getArticles({ category: category._id, limit })
      .then(res => setArticles(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category?._id, limit])

  if (!category) return null
  if (!loading && articles.length === 0) return null

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between border-t-4 border-dark pt-3 mb-6">
        <h2 className="text-dark font-black text-lg uppercase tracking-wide">{title || category.name}</h2>
        <Link to={`/${category.slug}`} className="text-primary text-sm font-semibold hover:underline">See all →</Link>
      </div>

      {loading ? (
        <>
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-xl mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
          <div className="md:hidden divide-y divide-gray-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                <div className="w-28 h-20 flex-shrink-0 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {articles.map(article => <ArticleCard key={article._id} article={article} />)}
          </div>
          <div className="md:hidden divide-y divide-gray-200">
            {articles.map(article => <ArticleCard key={article._id} article={article} variant="horizontal" />)}
          </div>
        </>
      )}
    </div>
  )
}