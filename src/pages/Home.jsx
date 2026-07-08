import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getHomeFeed, timeAgo } from '../utils/api'
import ArticleCard from '../components/ui/ArticleCard'
import AdBanner from '../components/ui/AdBanner'
import BreakingTicker from '../components/ui/BreakingTicker'
import Newsletter from '../components/ui/Newsletter'
import TopStories from '../components/ui/TopStories'

// Homepage rotation: Hero (1) -> Side news (4) -> Latest news (6) -> Top
// Stories (6 per category tab). One backend call (getHomeFeed) computes
// all four sections against a single shared exclusion list, so no article
// can ever appear twice on the page. Once a story ages out of Top
// Stories it simply isn't in any of these sections anymore — it still
// lives on its own category/team/competition page via normal pagination.
export default function Home() {
  const [hero, setHero] = useState(null)
  const [side, setSide] = useState([])
  const [latest, setLatest] = useState([])
  const [topStoriesByCategory, setTopStoriesByCategory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHomeFeed({ limit: 6 })
      .then(res => {
        const d = res.data.data
        setHero(d.hero || null)
        setSide(d.sideNews || [])
        setLatest(d.latestNews || [])
        setTopStoriesByCategory(d.topStoriesByCategory || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Helmet>
        <title>Ten Sports — Football, Basketball & More</title>
        <meta name="description" content="Your number one source for football, basketball, tennis and all things sports." />
      </Helmet>

      <BreakingTicker />

      <div className="max-w-7xl mx-auto px-4 py-">
        {/* <AdBanner size="leaderboard" /> */}

        {/* Hero block: 1 main story + 4 side news */}
        {!loading && (hero || side.length > 0) && (
          <>
            {/* Desktop hero */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-4 mt-8 mb-6">
              <div className="lg:col-span-2">
                {hero && <ArticleCard article={hero} variant="featured" />}
              </div>
              <div className="space-y-3">
                {side.slice(0, 4).map(article => (
                  <ArticleCard key={article._id} article={article} variant="horizontal" />
                ))}
              </div>
            </div>

            {/* Mobile hero */}
            <div className="lg:hidden mt-0 -mx-4 sm:-mx-6 mb-6">
              {hero && (
                <Link to={`/article/${hero.slug}`} className="group block relative">
                  <div className="w-full h-[420px] sm:h-[500px] overflow-hidden">
                    {hero.featuredImage?.url
                      ? <img src={hero.featuredImage.url} alt={hero.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full bg-surface" />
                    }
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-primary text-dark px-2 py-0.5 rounded mb-2">
                      {hero.category?.name}
                    </span>
                    <h2 className="text-2xl font-bold leading-snug text-white line-clamp-2 mb-1">{hero.title}</h2>
                    <p className="text-sm text-zinc-300 line-clamp-2 mb-2">{hero.excerpt}</p>
                    <p className="text-xs text-gray-400">{timeAgo(hero.publishedAt)}</p>
                  </div>
                </Link>
              )}

              <div className="bg-dark divide-y divide-gray-800 px-4 sm:px-6">
                {side.slice(0, 4).map(a => (
                  <Link key={a._id} to={`/article/${a.slug}`} className="group flex items-center gap-4 py-4">
                    <div className="w-28 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-surface">
                      {a.featuredImage?.url
                        ? <img src={a.featuredImage.url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full bg-surface" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-primary text-xs font-bold uppercase tracking-wide">{a.category?.name}</span>
                      <h4 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mt-0.5">{a.title}</h4>
                      <p className="text-gray-500 text-xs mt-1">{timeAgo(a.publishedAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Latest News: next 6, excludes hero + side */}
        <div className="mb-10">
          <div className="flex items-center justify-between border-t-4 border-dark pt-3 mb-6">
            <h2 className="text-dark font-black text-lg uppercase tracking-wide">Latest News</h2>
            <Link to="/search" className="text-primary text-sm font-semibold hover:underline">See all →</Link>
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
                {latest.map(article => <ArticleCard key={article._id} article={article} />)}
              </div>
              <div className="md:hidden divide-y divide-gray-200">
                {latest.map(article => <ArticleCard key={article._id} article={article} variant="horizontal" />)}
              </div>
            </>
          )}
        </div>

        {/* Top Stories: tabbed by category, 6 per tab, excludes everything above */}
        {!loading && <TopStories topStoriesByCategory={topStoriesByCategory} />}

        <AdBanner size="leaderboard" />
        <div className="my-10"><Newsletter /></div>
      </div>
    </>
  )
}