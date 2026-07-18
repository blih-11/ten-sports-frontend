import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getArticles, getCategories } from '../utils/api'
import { canonicalUrl } from '../utils/seo'
import ArticleCard from '../components/ui/ArticleCard'
import CategoryHero from '../components/ui/CategoryHero'
import CategoryUpcomingMatches from '../components/ui/CategoryUpcomingMatches'
import CategoryResults from '../components/ui/CategoryResults'
import CategorySidebar from '../components/ui/CategorySidebar'
import SidebarStandings from '../components/ui/SidebarStandings'
import AdBanner from '../components/ui/AdBanner'
import { ArticleSkeleton } from '../components/ui/Skeleton'
import NotFound from './NotFound'
import ResultsTab from '../components/ui/ResultsTab'
import TableTab from '../components/ui/TableTab'

const HERO_SIDE_COUNT = 12
const BELOW_HERO_COUNT = 6

const SPORT_TABS = {
  football: [
    { key: 'news',         label: 'News' },
    { key: 'results',      label: 'Results & Fixtures' },
    { key: 'teams',        label: 'Teams' },
    { key: 'competitions', label: 'Competitions' },
    { key: 'table',        label: 'Table' },
  ],
  nba: [
    { key: 'news',      label: 'News' },
    { key: 'standings', label: 'Standings' },
    { key: 'results',   label: 'Results & Fixtures' },
  ],
  default: [
    { key: 'news',      label: 'News' },
    { key: 'standings', label: 'Standings' },
    { key: 'results',   label: 'Results & Fixtures' },
  ],
}

export default function CategoryPage() {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [allCategories, setAllCategories]         = useState([])
  const [category, setCategory]                   = useState(null)
  const [articles, setArticles]                   = useState([])
  const [loading, setLoading]                     = useState(true)
  const [notFound, setNotFound]                   = useState(false)
  const [latestNews, setLatestNews]               = useState([])
  const [latestPage, setLatestPage]               = useState(1)
  const [latestTotalPages, setLatestTotalPages]   = useState(1)
  const [latestLoading, setLatestLoading]         = useState(true)
  const [loadingMore, setLoadingMore]             = useState(false)

  const tabs      = SPORT_TABS[categorySlug] || SPORT_TABS.default
  const activeTab = searchParams.get('tab') || 'news'

  const setTab = (key) => {
    setSearchParams({ tab: key }, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setNotFound(false)
    setLatestNews([])
    setLatestPage(1)
  }, [categorySlug])

  useEffect(() => {
    getCategories().then(res => setAllCategories(res.data.data || [])).catch(console.error)
  }, [])

  useEffect(() => {
    if (allCategories.length === 0) return
    const match = allCategories.find(c => c.slug === categorySlug)
    if (!match) { setNotFound(true); setLoading(false); return }
    setCategory(match)
    getArticles({ category: match._id, limit: 1 + HERO_SIDE_COUNT + BELOW_HERO_COUNT, page: 1 })
      .then(res => setArticles(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [allCategories, categorySlug])

  useEffect(() => {
    if (!category?._id) return
    if (latestPage === 1) setLatestLoading(true)
    else setLoadingMore(true)
    getArticles({ category: category._id, limit: 9, page: latestPage })
      .then(res => {
        const incoming = res.data.data || []
        setLatestNews(prev => latestPage === 1 ? incoming : [...prev, ...incoming])
        setLatestTotalPages(res.data.pages || 1)
      })
      .catch(console.error)
      .finally(() => { setLatestLoading(false); setLoadingMore(false) })
  }, [category?._id, latestPage])

  useEffect(() => {
    if (activeTab === 'transfers') navigate('/transfer-news', { replace: true })
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  if (notFound) return <NotFound />

  const catName        = category?.name || categorySlug
  const hero           = articles[0] || null
  const side           = articles.slice(1, 1 + HERO_SIDE_COUNT)
  const topSix         = articles.slice(0, 6)
  const aboveFoldIds   = new Set(articles.map(a => a._id).filter(Boolean))
  const filteredLatest = latestNews.filter(a => !aboveFoldIds.has(a._id))
  const hasMore        = latestPage < latestTotalPages
  const sidebarExclude = articles.map(a => a._id).filter(Boolean)

  return (
    <>
      <Helmet>
        <title>{catName} — Tave Sports</title>
        <meta name="description" content={`Latest ${catName} news, updates and analysis from Tave Sports.`} />
        <link rel="canonical" href={canonicalUrl(activeTab === 'news' ? `/${categorySlug}` : `/${categorySlug}?tab=${activeTab}`)} />
      </Helmet>

      {/* ── Single sticky sub-nav — all screen sizes ── */}
      {/* <div className="bg-dark border-b border-gray-800 sticky top-[56px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            <span className="text-primary font-black text-sm uppercase tracking-widest whitespace-nowrap pr-4 py-3 border-r border-gray-700 mr-1 shrink-0">
              {catName}
            </span>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`px-3 sm:px-5 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                  activeTab === tab.key
                    ? 'text-primary border-primary'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div> */}

      {/* ── Page title + breadcrumb — desktop only ── */}
      {/* <div className="hidden md:block bg-dark border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>›</span>
            <span className="text-gray-300">{catName}</span>
          </div>
          <h1 className="text-white font-black text-4xl uppercase tracking-tight leading-none">
            {catName}<span className="text-primary">.</span>
          </h1>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── News tab ── */}
        {activeTab === 'news' && (
          <>
            {/* Mobile layout */}
        {/* Mobile layout */}
<div className="md:hidden">
  {!loading && hero && (
    <CategoryHero hero={hero} side={side} />
  )}
  {!loading && <CategoryUpcomingMatches categorySlug={categorySlug} />}
  {!loading && <CategoryResults categorySlug={categorySlug} />}

  <div className="mt-6">
    <div className="border-t-4 border-dark pt-3 mb-4">
      <h2 className="text-dark font-black text-lg uppercase tracking-wide">Latest News</h2>
    </div>

    {latestLoading ? (
      <div className="divide-y divide-gray-200">
        {[...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)}
      </div>
    ) : (
      <div className="divide-y divide-gray-200">
        {filteredLatest.map(a => <ArticleCard key={a._id} article={a} variant="horizontal" />)}
      </div>
    )}

    {hasMore && !latestLoading && (
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setLatestPage(p => p + 1)}
          disabled={loadingMore}
          className="px-8 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary transition-all bg-white disabled:opacity-50"
        >
          {loadingMore ? 'Loading...' : 'Show More'}
        </button>
      </div>
    )}

    {/* Standings — always below latest news, outside loading conditional */}
    {!loading && (
      <div className="mt-10">
        {/* <div className="border-t-4 border-dark pt-3 mb-4">
          <h2 className="text-dark font-black text-lg uppercase tracking-wide">Table</h2>
        </div> */}
        <SidebarStandings categorySlug={categorySlug} />
      </div>
    )}
  </div>
</div>

            {/* Desktop layout — two column */}
            <div className="hidden md:grid md:grid-cols-[1fr_300px] gap-10">

              {/* Left — main content */}
              <div className="min-w-0">
                <AdBanner slotKey="slot_category_leaderboard" />

                {/* Top 6 articles in 3-col grid */}
                {!loading && (
                  <div className="mt-6 grid grid-cols-3 gap-5 mb-8">
                    {topSix.map(a => <ArticleCard key={a._id} article={a} />)}
                  </div>
                )}

                {!loading && <CategoryUpcomingMatches categorySlug={categorySlug} />}
                {!loading && <CategoryResults categorySlug={categorySlug} />}

                {/* Latest News */}
                <div className="mt-8">
                  <div className="border-t-4 border-dark pt-3 mb-6">
                    <h2 className="text-dark font-black text-lg uppercase tracking-wide">Latest News</h2>
                  </div>
                  {latestLoading ? (
                    <div className="grid grid-cols-3 gap-6">
                      {[...Array(9)].map((_, i) => <ArticleSkeleton key={i} />)}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-6 mb-8">
                        {filteredLatest.map(a => <ArticleCard key={a._id} article={a} />)}
                      </div>
                      {hasMore && (
                        <div className="flex justify-center">
                          <button onClick={() => setLatestPage(p => p + 1)} disabled={loadingMore}
                            className="px-10 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary transition-all bg-white disabled:opacity-50">
                            {loadingMore ? 'Loading...' : 'Show More'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Right — sticky sidebar */}
              <div className="hidden md:block">
                <div className="sticky top-[100px]">
                  <CategorySidebar categorySlug={categorySlug} excludeIds={sidebarExclude} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Results & Fixtures tab ── */}
        {activeTab === 'results' && <ResultsTab categorySlug={categorySlug} />}

        {/* Transfers now lives only at /transfer-news — see the redirect
            effect above for the old ?tab=transfers URL. */}

{/* ── Table tab ── */}
{activeTab === 'table' && (
  <TableTab sport={categorySlug} />
)}

        {/* ── Standings tab (non-football) ── */}
        {activeTab === 'standings' && (
          <div className="max-w-lg mx-auto mt-6">
            <SidebarStandings categorySlug={categorySlug} showFull />
          </div>
        )}

        {/* ── Teams tab ── */}
        {activeTab === 'teams' && (
          <div className="py-8 text-center text-gray-400">
            <p className="text-lg font-semibold">Teams coming soon</p>
          </div>
        )}

        {/* ── Competitions tab ── */}
        {activeTab === 'competitions' && (
          <div className="py-8 text-center text-gray-400">
            <p className="text-lg font-semibold">Competitions coming soon</p>
          </div>
        )}

      </div>
    </>
  )
}