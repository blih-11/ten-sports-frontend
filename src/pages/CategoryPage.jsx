import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getArticles, getCategories, timeAgo } from '../utils/api'
import ArticleCard, { HeroThumb } from '../components/ui/ArticleCard'
import CategoryHero from '../components/ui/CategoryHero'
import CategoryUpcomingMatches from '../components/ui/CategoryUpcomingMatches'
import CategoryResults from '../components/ui/CategoryResults'
import CategorySidebar from '../components/ui/CategorySidebar'
import SidebarStandings from '../components/ui/SidebarStandings'
import TransfersTab from '../components/ui/TransfersTab'
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
    { key: 'transfers',    label: 'Transfers' },
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
        <title>{catName} — Ten Sports</title>
        <meta name="description" content={`Latest ${catName} news, updates and analysis from Ten Sports.`} />
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

        {/* ── Transfers tab ── */}
        {activeTab === 'transfers' && (
          <>
            {!loading && hero && (
              <>
                {/* Mobile hero */}
                <div className="lg:hidden -mx-4 sm:-mx-6 mb-6">
                  <Link to={`/article/${hero.slug}`} className="group block relative">
                    <div className="w-full h-[420px] sm:h-[500px] overflow-hidden">
                      <HeroThumb article={hero} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" placeholderClass="w-full h-full bg-surface" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-primary text-dark px-2 py-0.5 rounded mb-2">{hero.category?.name}</span>
                      <h2 className="text-2xl font-bold leading-snug text-white line-clamp-2 mb-1">{hero.title}</h2>
                      <p className="text-sm text-zinc-300 line-clamp-2 mb-2">{hero.excerpt}</p>
                      <p className="text-xs text-gray-400">{timeAgo(hero.publishedAt)}</p>
                    </div>
                  </Link>
                </div>

                {/* Desktop hero + transfer header */}
                <div className="hidden lg:block">
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h1 className="text-dark font-black text-2xl sm:text-3xl leading-tight mb-3">Football Transfer News, Updates and Rumours</h1>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm">Share:</span>
                      {[
                        { href: 'https://facebook.com/sharer', bg: 'bg-[#1877F2]', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.94 8.44-9.94z"/></svg> },
                        { href: 'https://x.com/intent/tweet', bg: 'bg-black', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.9 2H22l-7.1 8.1L23 22h-6.6l-5.2-6.8L5 22H2l7.6-8.7L1.3 2H8l4.7 6.2L18.9 2zm-2.3 18h1.8L7.5 4H5.6l11 16z"/></svg> },
                        { href: 'https://wa.me/?text=', bg: 'bg-[#25D366]', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.9-.4-1.8-1-2.6-1.8-.7-.7-1.3-1.5-1.8-2.4-.1-.3-.1-.5.1-.6.2-.2.5-.5.6-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.6-1 2.6.1 1.1.6 2.2 1.3 3.2 1.4 2 3.2 3.5 5.3 4.5 1 .5 2 .8 3.1.9.7.1 1.4-.1 2-.5.6-.4 1-1.1 1.1-1.8 0-.2 0-.5-.1-.6-.1-.1-.5-.3-.8-.4z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.2L2 22l4.9-1.3C8.3 21.5 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.2-.4-4.6-1.3l-.3-.2-3.3.9.9-3.2-.2-.3C3.6 14.4 3.2 12.7 3.2 11 3.2 6.5 6.5 3.2 11 3.2c4.5 0 8.8 4.3 8.8 8.8 0 4.5-3.3 8.2-7.8 8.2z"/></svg> },
                        { href: 'mailto:?subject=Transfer News', bg: 'bg-gray-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
                      ].map((s, i) => (
                        <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                          className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center text-white hover:opacity-90 transition-opacity`}>
                          {s.icon}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_300px] gap-10">
                    <Link to={`/article/${hero.slug}`} className="group block relative overflow-hidden rounded-xl bg-dark">
                      <div className="aspect-[16/7] overflow-hidden">
                        <HeroThumb article={hero} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" placeholderClass="w-full h-full bg-surface" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-primary text-dark px-2 py-0.5 rounded mb-2">{hero.category?.name}</span>
                        <h2 className="text-white font-black text-2xl leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-1">{hero.title}</h2>
                        {hero.excerpt && <p className="text-gray-300 text-sm line-clamp-1">{hero.excerpt}</p>}
                        <p className="text-gray-400 text-xs mt-2">{timeAgo(hero.publishedAt)}</p>
                      </div>
                    </Link>
                    <div className="flex flex-col gap-4">
                      <AdBanner size="rectangle" slotKey="slot_category_rectangle" />
                    </div>
                  </div>
                </div>
              </>
            )}
            <TransfersTab categoryId={category?._id} />
          </>
        )}

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