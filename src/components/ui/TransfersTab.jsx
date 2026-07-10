import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api, { getArticles, timeAgo, cardImage } from '../../utils/api'
import { getTeamLogo } from '../../data/logos'

const PAGE_SIZE = 8

const LEAGUES = [
  { label: 'Premier League', slug: 'premier-league' },
  { label: 'La Liga',        slug: 'la-liga' },
  { label: 'Serie A',        slug: 'serie-a' },
  { label: 'Bundesliga',     slug: 'bundesliga' },
  { label: 'Ligue 1',        slug: 'ligue-1' },
]

function TeamTag({ tags = [] }) {
  if (!tags || tags.length === 0) return null
  const team = tags[0]
  const logo = getTeamLogo(team)

  if (logo) {
    return (
      <span className="absolute bottom-3 right-3 bg-white shadow-md rounded-lg p-1.5">
        <img src={logo} alt={team} className="w-5 h-5 object-contain" />
      </span>
    )
  }

  return (
    <span className="absolute bottom-3 right-3 bg-dark/80 text-primary text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-lg backdrop-blur-sm">
      {team}
    </span>
  )
}

function TransferCard({ article }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {cardImage(article)
          ? <img src={cardImage(article)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100" />
        }
        <TeamTag tags={article.tags} />
      </div>
      <div className="p-4">
        <h3 className="text-gray-900 font-bold text-sm leading-snug group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-gray-400 text-xs mt-2">{timeAgo(article.publishedAt)}</p>
      </div>
    </Link>
  )
}

function SortToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      <span className="text-gray-500 text-sm font-medium">Sort by:</span>
      <div className="flex bg-gray-100 rounded-full p-1 gap-1">
        {['latest', 'oldest'].map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-all ${
              value === opt
                ? 'bg-primary text-dark shadow-sm'
                : 'text-gray-500 hover:text-dark'
            }`}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

function NewsSection({ label, categoryId, tag, sort, excludeId }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // Combine whichever filters are provided: Top Stories uses category +
  // the transfer tag together, league sections use tag only (transfer +
  // league slug, already comma-joined by the caller).
  const filterParams = {
    ...(categoryId ? { category: categoryId } : {}),
    ...(tag ? { tag } : {}),
  }

  useEffect(() => {
    if (!categoryId && !tag) return
    setLoading(true)
    setPage(1)
    getArticles({ ...filterParams, limit: PAGE_SIZE, page: 1, sort: sort === 'oldest' ? 'asc' : 'desc' })
      .then(res => {
        const data = (res.data.data || []).filter(a => a._id !== excludeId)
        setArticles(data)
        setHasMore(data.length === PAGE_SIZE)
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [categoryId, tag, sort])

  const loadMore = () => {
    const next = page + 1
    setLoadingMore(true)
    getArticles({ ...filterParams, limit: PAGE_SIZE, page: next, sort: sort === 'oldest' ? 'asc' : 'desc' })
      .then(res => {
        const data = (res.data.data || []).filter(a => a._id !== excludeId)
        setArticles(prev => [...prev, ...data])
        setPage(next)
        setHasMore(data.length === PAGE_SIZE)
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false))
  }

  if (!loading && articles.length === 0) return null

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between border-t-4 border-dark pt-3 mb-6">
        <h2 className="text-dark font-black text-lg uppercase tracking-wide">{label}</h2>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-200 animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {articles.map(a => <TransferCard key={a._id} article={a} />)}
          </div>
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-dark text-white font-bold rounded-xl hover:bg-primary hover:text-dark transition-all disabled:opacity-50 text-sm"
              >
                {loadingMore ? 'Loading...' : `More ${label}`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function TransfersTab({ categoryId, excludeId }) {
  const [sort, setSort] = useState('latest')
  if (!categoryId) return null

  return (
    <div className="mt-6">
      <SortToggle value={sort} onChange={setSort} />
      <NewsSection label="Top Stories" categoryId={categoryId} tag="transfer" sort={sort} excludeId={excludeId} />
      {LEAGUES.map(league => (
        <NewsSection
          key={league.slug}
          label={`${league.label} Transfers`}
          tag={`transfer,${league.slug}`}
          sort={sort}
        />
      ))}
    </div>
  )
}