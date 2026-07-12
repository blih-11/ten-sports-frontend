import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getArticles } from '../utils/api'
import ArticleCard from '../components/ui/ArticleCard'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState(q)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    getArticles({ search: q, limit: 12 })
      .then(res => setArticles(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [q])

  const handleSearch = (e) => {
    e.preventDefault()
    if (input.trim()) setSearchParams({ q: input.trim() })
  }

  return (
    <>
      <Helmet>
        <title>{q ? `Search: ${q}` : 'Search'} — Ten Sports</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="bg-dark py-10">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-white font-black text-3xl mb-4">Search</h1>
          <form onSubmit={handleSearch} className="flex gap-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search articles..."
              className="flex-1 bg-surface text-white px-5 py-3 rounded-l-xl outline-none border border-gray-700 focus:border-primary text-sm"
            />
            <button type="submit" className="bg-primary text-dark px-6 py-3 rounded-r-xl font-bold text-sm hover:bg-yellow-300 transition-colors">Search</button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {q && <p className="text-gray-500 text-sm mb-6">{loading ? 'Searching...' : `${articles.length} results for "${q}"`}</p>}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-video bg-gray-200 rounded-xl mb-3" /><div className="h-4 bg-gray-200 rounded" /></div>)}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map(a => <ArticleCard key={a._id} article={a} />)}
          </div>
        ) : q ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl font-semibold mb-2">No results found</p>
            <p className="text-sm">Try different keywords</p>
          </div>
        ) : null}
      </div>
    </>
  )
}
