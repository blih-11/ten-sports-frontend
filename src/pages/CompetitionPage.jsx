import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api, { getFixtures, getCompetitionFeed, timeAgo, cardImage } from '../utils/api'
import ArticleCard from '../components/ui/ArticleCard'
import CategoryHero from '../components/ui/CategoryHero'
import AdBanner from '../components/ui/AdBanner'
import SidebarStandings from '../components/ui/SidebarStandings'
import { ArticleSkeleton } from '../components/ui/Skeleton'
import TeamLogo from '../components/ui/TeamLogo'
import LeagueLogo from '../components/ui/LeagueLogo'

const HERO_SIDE_COUNT = 12
const BELOW_HERO_COUNT = 6

const DEFAULT_COMPETITIONS = {
  'premier-league':   { name: 'Premier League',   country: 'England', sport: 'football' },
  'championship':     { name: 'Championship',     country: 'England', sport: 'football' },
  'league-one':       { name: 'League One',       country: 'England', sport: 'football' },
  'league-two':       { name: 'League Two',       country: 'England', sport: 'football' },
  'champions-league': { name: 'Champions League', country: 'Europe',  sport: 'football' },
  'europa-league':    { name: 'Europa League',    country: 'Europe',  sport: 'football' },
  'la-liga':          { name: 'La Liga',          country: 'Spain',   sport: 'football' },
  'serie-a':          { name: 'Serie A',          country: 'Italy',   sport: 'football' },
  'bundesliga':       { name: 'Bundesliga',       country: 'Germany', sport: 'football' },
  'ligue-1':          { name: 'Ligue 1',          country: 'France',  sport: 'football' },
  'nba':              { name: 'NBA',              country: 'USA',     sport: 'basketball' },
}

const TABS = [
  { key: 'news',      label: 'News' },
  { key: 'results',   label: 'Results & Fixtures' },
  { key: 'transfers', label: 'Transfers' },
  { key: 'standings', label: 'Standings' },
]

const NEWS_HEADLINES = [
  '{comp} title race heats up with five games to go',
  'Player of the week: the standout performer in {comp}',
  '{comp} club sacks manager after poor run of form',
  'Tactical analysis: how the top teams in {comp} line up',
  'Transfer round-up: the latest {comp} news',
  '{comp} season review: who impressed and who disappointed',
  'Rising stars: five {comp} players to watch',
  '{comp} fixtures released for the new season',
  'VAR controversy dominates {comp} headlines again',
  'Behind the scenes at a {comp} matchday',
  '{comp} club breaks attendance record',
  'Injury update: the latest from {comp} clubs',
  '{comp} golden boot race: who leads the charts',
  'Five things we learned from {comp} this weekend',
  'Manager of the month: {comp} award winner revealed',
  '{comp} preview: what to expect this matchweek',
  'Stats that tell the story of the {comp} season',
  '{comp} fans react to latest controversial decision',
  'How {comp} compares to other top European leagues',
  'Ones to watch: {comp} players in fine form',
  'The best goals scored in {comp} this season',
  'Relegation battle: who is at risk in {comp}',
  '{comp} top scorer interview: in my own words',
  'The week in {comp}: everything you need to know',
  'Expert verdict: {comp} title race prediction',
  'Youth spotlight: {comp} academy graduates making waves',
  '{comp} press conference: managers face the media',
]

function buildDefaultArticles(competition) {
  const name = competition?.name || 'This Competition'
  const now = Date.now()
  return NEWS_HEADLINES.map((template, i) => ({
    _id: `mock-comp-${competition?.slug || 'comp'}-${i}`,
    slug: `placeholder-comp-${competition?.slug || 'comp'}-${i}`,
    title: template.replace(/{comp}/g, name),
    excerpt: `Placeholder summary for ${name} — swap this for real tagged articles whenever you're ready.`,
    category: { name: 'Football', slug: 'football' },
    publishedAt: new Date(now - i * 3 * 60 * 60 * 1000).toISOString(),
    featuredImage: { url: `https://picsum.photos/seed/comp-${competition?.slug || 'comp'}-${i}/800/450` },
    isBreaking: i === 0,
    tags: [competition?.slug].filter(Boolean),
  }))
}

// ─── Same opponents/fixtures helpers as TeamPage ─────────────────
const DEFAULT_OPPONENTS = [
  'Riverside Athletic', 'Ashford Town', 'Kingsmoor FC', 'Whitfield Rovers',
  'Sundale City', 'Ellwood Park', 'Marchvale United', 'Brookfield Albion',
  'Castlemere FC', 'Oldbury Wanderers',
]

function buildDefaultFixtures(competition) {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const pool = DEFAULT_OPPONENTS
  const upcoming = pool.slice(0, 4).map((opp, i) => ({
    _id: `mock-fixture-upcoming-comp-${competition.slug}-${i}`,
    homeTeam: i % 2 === 0 ? { name: 'Home Side', logo: '' } : { name: opp, logo: '' },
    awayTeam: i % 2 === 0 ? { name: opp, logo: '' } : { name: 'Away Side', logo: '' },
    date: new Date(now + (i + 1) * 7 * day).toISOString(),
    status: { short: 'NS' },
    score: { home: null, away: null },
  }))
  const past = pool.slice(4, 10).map((opp, i) => ({
    _id: `mock-fixture-past-comp-${competition.slug}-${i}`,
    homeTeam: i % 2 === 1 ? { name: 'Home Side', logo: '' } : { name: opp, logo: '' },
    awayTeam: i % 2 === 1 ? { name: opp, logo: '' } : { name: 'Away Side', logo: '' },
    date: new Date(now - (i + 1) * 7 * day).toISOString(),
    status: { short: 'FT' },
    score: { home: (i * 2 + 1) % 4, away: (i + 2) % 3 },
  }))
  return [...upcoming, ...past]
}

function startOfDay(d) {
  const c = new Date(d); c.setHours(0, 0, 0, 0); return c
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function buildDays(anchor) {
  const days = []
  for (let i = -7; i <= 7; i++) {
    const d = new Date(anchor)
    d.setDate(anchor.getDate() + i)
    days.push(startOfDay(d))
  }
  return days
}

function formatGroupDate(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function TabSkeleton({ rows = false }) {
  if (rows) return (
    <div className="mt-6 space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  )
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-gray-200 animate-pulse">
          <div className="aspect-video bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Match row — identical to TeamPage's TeamMatchRow ─────────────
function CompMatchRow({ fixture }) {
  const isFinished = fixture.status?.short === 'FT'
  const isLive     = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixture.status?.short)
  const isUpcoming = fixture.status?.short === 'NS'

  return (
    <Link
      to={`/match/${fixture._id}`}
      className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <TeamLogo name={fixture.homeTeam?.name} logo={fixture.homeTeam?.logo} className="w-5 h-5" />
        <span className="text-sm font-semibold text-gray-800 truncate">{fixture.homeTeam?.name}</span>
      </div>

      <div className="shrink-0 text-center min-w-[64px]">
        {isUpcoming ? (
          <span className="text-xs font-bold text-gray-500">
            {new Date(fixture.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        ) : (
          <span className={`text-base font-black ${isLive ? 'text-primary' : 'text-gray-900'}`}>
            {fixture.score?.home ?? '-'} — {fixture.score?.away ?? '-'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-sm font-semibold text-gray-800 truncate text-right">{fixture.awayTeam?.name}</span>
        <TeamLogo name={fixture.awayTeam?.name} logo={fixture.awayTeam?.logo} className="w-5 h-5" />
      </div>
    </Link>
  )
}

// ─── Date slider — identical to TeamPage's TeamDateSlider ─────────
function CompDateSlider({ selected, onSelect }) {
  const today     = startOfDay(new Date())
  const anchor    = startOfDay(selected)
  const days      = buildDays(anchor)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const active = el.querySelector('[data-selected="true"]')
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [selected])

  const monthLabel = selected.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => { const d = new Date(selected); d.setDate(d.getDate() - 7); onSelect(startOfDay(d)) }}
          className="text-gray-400 hover:text-dark transition-colors text-xl leading-none px-2"
        >‹</button>
        <span className="text-sm font-black text-gray-700">{monthLabel}</span>
        <button
          onClick={() => { const d = new Date(selected); d.setDate(d.getDate() + 7); onSelect(startOfDay(d)) }}
          className="text-primary hover:text-yellow-500 transition-colors text-xl leading-none px-2 font-bold"
        >›</button>
      </div>

      <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide py-2 px-2 gap-1 justify-center">
        {days.map((d, i) => {
          const isSelected = isSameDay(d, selected)
          const isToday    = isSameDay(d, today)
          return (
            <button
              key={i}
              data-selected={isSelected ? 'true' : undefined}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-center justify-center px-2.5 py-2 rounded-lg shrink-0 min-w-[52px] transition-all ${
                isSelected ? 'bg-primary text-dark'
                : isToday  ? 'bg-gray-100 text-gray-800 font-bold'
                :             'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase leading-tight">
                {d.toLocaleDateString('en-GB', { weekday: 'short' })}
              </span>
              <span className="text-base font-black leading-tight">{d.getDate()}</span>
              <span className="text-[10px] leading-tight opacity-70">
                {d.toLocaleDateString('en-GB', { month: 'short' })}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Results & Fixtures tab — identical to TeamPage's TeamResultsTab
function CompResultsTab({ competition }) {
  const [fixtures, setFixtures]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))

  useEffect(() => {
    setLoading(true)
    getFixtures({ leagueSlug: competition.slug, limit: 100 })
      .then(res => {
        const data = res.data.data || []
        setFixtures(data.length > 0 ? data : buildDefaultFixtures(competition))
      })
      .catch(() => setFixtures(buildDefaultFixtures(competition)))
      .finally(() => setLoading(false))
  }, [competition.slug])

  const dayFixtures = fixtures
    .filter(f => isSameDay(new Date(f.date), selectedDate))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const dateLabel = formatGroupDate(selectedDate)

  return (
    <div className="mt-6 mx-auto" style={{ maxWidth: 860 }}>
      <CompDateSlider selected={selectedDate} onSelect={setSelectedDate} />

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : dayFixtures.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
          <p className="text-gray-600 font-black text-lg">{dateLabel}</p>
          <p className="text-gray-400 text-sm mt-2">There are no matches available on this date.</p>
          <p className="text-gray-300 text-xs mt-1">Try a different date.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">{dateLabel}</h3>
          </div>
          {dayFixtures.map(f => <CompMatchRow key={f._id} fixture={f} />)}
        </div>
      )}
    </div>
  )
}

// ─── Sidebar — identical to TeamPage's TeamSidebar ────────────────
function CompSidebar({ competition, excludeIds = [] }) {
  const [recent, setRecent]         = useState([])
  const [recentLoading, setRecentLoading] = useState(true)

  useEffect(() => {
    setRecentLoading(true)
    getCompetitionFeed(competition.slug, { limit: 8 })
      .then(res => {
        const data = res.data.data?.latestNews || []
        const filtered = data.filter(a => !excludeIds.includes(a._id)).slice(0, 6)
        setRecent(filtered.length > 0 ? filtered : buildDefaultArticles(competition).slice(6, 12))
      })
      .catch(() => setRecent(buildDefaultArticles(competition).slice(6, 12)))
      .finally(() => setRecentLoading(false))
  }, [competition.slug, excludeIds.join(',')])

  return (
    <aside className="space-y-8">
      <SidebarStandings
        categorySlug="football"
        league={{ slug: competition.slug, name: competition.name }}
      />

      <div>
        <h3 className="font-black text-dark text-sm uppercase tracking-widest mb-3 border-t-4 border-dark pt-3">
          Latest Stories
        </h3>
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
        ) : recent.length === 0 ? (
          <p className="text-gray-400 text-xs">No other stories yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map(a => (
              <Link key={a._id} to={`/article/${a.slug}`}
                className="group flex gap-3 py-3 hover:opacity-80 transition-opacity">
                <div className="w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {cardImage(a)
                    ? <img src={cardImage(a)} alt={a.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gray-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 text-xs font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {a.title}
                  </h4>
                  <p className="text-gray-400 text-[10px] mt-1">{timeAgo(a.publishedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-100 rounded-xl h-60 flex items-center justify-center text-gray-400 text-xs font-medium uppercase tracking-widest">
        Advertisement
      </div>
    </aside>
  )
}

// ─── Next match / last result strip — identical to TeamPage's TeamNewsMatchStrip
function CompNewsMatchStrip({ competition }) {
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    getFixtures({ leagueSlug: competition.slug, limit: 20 })
      .then(res => setFixtures(res.data.data || []))
      .catch(() => setFixtures([]))
      .finally(() => setLoading(false))
  }, [competition.slug])

  if (loading) return (
    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  )

  const next = fixtures.filter(f => f.status?.short === 'NS').sort((a, b) => new Date(a.date) - new Date(b.date))[0]
  const last = fixtures.filter(f => f.status?.short === 'FT').sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  if (!next && !last) return null

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {next && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Next Match</span>
            </div>
            <CompMatchRow fixture={next} />
          </div>
        )}
        {last && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Result</span>
            </div>
            <CompMatchRow fixture={last} />
          </div>
        )}
      </div>
      <div className="mt-2 text-right">
        <Link to="?tab=results" className="text-primary text-xs font-bold hover:underline">
          Full fixtures & results →
        </Link>
      </div>
    </div>
  )
}

// ─── News tab — identical to TeamPage's TeamNewsTab ───────────────
function CompNewsTab({ competition }) {
  const [articles, setArticles]                 = useState([])
  const [loading, setLoading]                   = useState(true)
  const [latestNews, setLatestNews]             = useState([])
  const [latestPage, setLatestPage]             = useState(1)
  const [latestTotalPages, setLatestTotalPages] = useState(1)
  const [latestLoading, setLatestLoading]       = useState(true)
  const [loadingMore, setLoadingMore]           = useState(false)

  useEffect(() => {
    setLoading(true)
    setLatestNews([])
    setLatestPage(1)
    getCompetitionFeed(competition.slug)
      .then(res => {
        const data = res.data.data?.topStories || []
        setArticles(data.length > 0 ? data : buildDefaultArticles(competition))
      })
      .catch(() => setArticles(buildDefaultArticles(competition)))
      .finally(() => setLoading(false))
  }, [competition.slug])

  useEffect(() => {
    if (latestPage === 1) setLatestLoading(true)
    else setLoadingMore(true)
    getCompetitionFeed(competition.slug, { limit: 9, page: latestPage })
      .then(res => {
        const incoming = res.data.data?.latestNews || []
        if (incoming.length === 0 && latestPage === 1) {
          setLatestNews(buildDefaultArticles(competition).slice(1 + HERO_SIDE_COUNT + BELOW_HERO_COUNT))
          setLatestTotalPages(1)
        } else {
          setLatestNews(prev => latestPage === 1 ? incoming : [...prev, ...incoming])
          setLatestTotalPages(res.data.data?.latestNewsPagination?.pages || 1)
        }
      })
      .catch(() => {})
      .finally(() => { setLatestLoading(false); setLoadingMore(false) })
  }, [competition.slug, latestPage])

  const hero           = articles[0] || null
  const side           = articles.slice(1, 1 + HERO_SIDE_COUNT)
  const topSix         = articles.slice(0, 6)
  const aboveFoldIds   = new Set(articles.map(a => a._id).filter(Boolean))
  const filteredLatest = latestNews.filter(a => !aboveFoldIds.has(a._id))
  const hasMore        = latestPage < latestTotalPages
  const sidebarExclude = articles.map(a => a._id).filter(Boolean)

  return (
    <>
      {/* Mobile — identical to TeamPage mobile layout */}
      <div className="md:hidden">
        {!loading && hero && <CategoryHero hero={hero} side={side} />}

        <CompNewsMatchStrip competition={competition} />

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
              <button onClick={() => setLatestPage(p => p + 1)} disabled={loadingMore}
                className="px-8 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary transition-all bg-white disabled:opacity-50">
                {loadingMore ? 'Loading...' : 'Show More'}
              </button>
            </div>
          )}

          {!loading && (
            <div className="mt-10">
              <SidebarStandings
                categorySlug="football"
                league={{ slug: competition.slug, name: competition.name }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop — identical to TeamPage desktop layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_300px] gap-10">
        <div className="min-w-0">
          <AdBanner slotKey="slot_competition_leaderboard" />

          <div className="mt-6">
            <CompNewsMatchStrip competition={competition} />
          </div>

          {!loading && (
            <div className="grid grid-cols-3 gap-5 mb-8">
              {topSix.map(a => <ArticleCard key={a._id} article={a} />)}
            </div>
          )}

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

        <div className="hidden md:block">
          <div className="sticky top-[100px]">
            <CompSidebar competition={competition} excludeIds={sidebarExclude} />
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Transfers tab — identical to TeamPage's TeamTransfersTab ─────
function CompTransfersTab({ competition }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    getCompetitionFeed(competition.slug, { limit: 50 })
      .then(res => {
        const data = res.data.data?.latestNews || []
        const filtered = data.filter(a =>
          (a.tags || []).some(t => t.toLowerCase().includes('transfer')) ||
          /transfer/i.test(a.title)
        )
        setArticles(filtered)
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [competition.slug])

  if (loading) return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  )

  if (articles.length === 0) return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 p-12 text-center">
      <p className="text-gray-500 text-sm font-semibold">No transfer news for this competition right now.</p>
    </div>
  )

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {articles.map(a => <ArticleCard key={a._id} article={a} />)}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────
export default function CompetitionPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'news'

  const [competition, setCompetition] = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    api.get(`/leagues/${slug}`)
      .then(res => setCompetition({ slug, ...res.data.data }))
      .catch(() => {
        const fallback = DEFAULT_COMPETITIONS[slug]
        setCompetition(fallback
          ? { slug, logo: '', ...fallback }
          : { slug, name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), logo: '', country: '', sport: 'football' }
        )
      })
      .finally(() => setLoading(false))
  }, [slug])

  const setTab = (key) => {
    setSearchParams({ tab: key }, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Helmet>
        <title>{competition ? `${competition.name} — Ten Sports` : 'Competition — Ten Sports'}</title>
        <meta name="description" content={competition ? `Latest ${competition.name} news, fixtures, results and standings.` : ''} />
      </Helmet>

      {/* Sub-nav — identical structure to TeamPage */}
      <div className="bg-surface border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center overflow-x-auto scrollbar-hide">
            {loading ? (
              <span className="flex items-center gap-2 pr-3 py-2.5 border-r border-gray-700 mr-1 shrink-0">
                <span className="w-5 h-5 rounded-full bg-gray-700 animate-pulse shrink-0" />
                <span className="h-3 w-24 bg-gray-700 rounded animate-pulse" />
              </span>
            ) : (
              <span className="flex items-center gap-2 pr-3 py-2.5 border-r border-gray-700 mr-1 shrink-0">
                <LeagueLogo slug={competition?.slug} name={competition?.name} logo={competition?.logo} className="w-5 h-5" />
                <span className="text-primary font-black text-xs uppercase tracking-widest whitespace-nowrap">
                  {competition?.name}
                </span>
              </span>
            )}

            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`px-3 md:px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                  activeTab === tab.key
                    ? 'text-primary border-primary'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'news' && (
          competition ? <CompNewsTab competition={competition} /> : <TabSkeleton />
        )}
        {activeTab === 'results' && (
          competition ? <CompResultsTab competition={competition} /> : <TabSkeleton rows />
        )}
        {activeTab === 'transfers' && (
          competition ? <CompTransfersTab competition={competition} /> : <TabSkeleton />
        )}
        {activeTab === 'standings' && (
          competition ? (
            <div className="max-w-lg mx-auto mt-6">
              <SidebarStandings
                categorySlug="football"
                showFull
                league={{ slug: competition.slug, name: competition.name }}
              />
            </div>
          ) : <TabSkeleton rows />
        )}
      </div>
    </>
  )
}