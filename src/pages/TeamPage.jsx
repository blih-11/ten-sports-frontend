import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api, { getFixtures, getTeamFeed, timeAgo } from '../utils/api'
import ArticleCard, { CardThumb } from '../components/ui/ArticleCard'
import CategoryHero from '../components/ui/CategoryHero'
import AdBanner from '../components/ui/AdBanner'
import SidebarStandings from '../components/ui/SidebarStandings'
import { ArticleSkeleton } from '../components/ui/Skeleton'
import TeamLogo from '../components/ui/TeamLogo'

const HERO_SIDE_COUNT = 12
const BELOW_HERO_COUNT = 6

// Generates placeholder articles so the News tab's hero/side/grid
// structure is visible before any real articles are tagged for this
// team. Swapped out automatically the moment real tagged articles exist
// (each fetch always prefers real data first).
const NEWS_HEADLINES = [
  '{team} boost as key player returns to training',
  'Player ratings: how {team} performed in their latest outing',
  '{team} manager gives injury update ahead of next fixture',
  'Report: {team} eyeing move for versatile January target',
  'Five talking points from {team}\u2019s week',
  '{team} youngster handed first-team chance',
  'Opinion: what {team} still need to fix',
  '{team} confirm squad news ahead of the weekend',
  'Behind the scenes: a day at {team}\u2019s training ground',
  'How {team} fans reacted to the latest result',
  '{team} set for busy run of fixtures',
  '{team} captain speaks on team spirit and form',
  '{team} academy graduate makes matchday squad',
  'Transfer whispers: {team} linked with defensive reinforcement',
  'Match preview: what to expect from {team} next time out',
  '{team} statement performance turns heads',
  'Tactical breakdown: {team}\u2019s shape this season',
  'Fan Q&A: your {team} questions answered',
  'On this day: a classic {team} moment revisited',
  '{team} supporters trust releases latest update',
  'Data dive: the numbers behind {team}\u2019s season',
  '{team} to wear special kit for upcoming fixture',
  'Loan watch: how {team}\u2019s players out on loan are doing',
  '{team} announce updated ticket details for members',
  'Comparing {team}\u2019s form home and away this season',
  'Youth report: {team}\u2019s academy side in action',
  '{team} press conference: manager faces the media',
]

function buildDefaultTeamArticles(team) {
  const name = team?.name || 'This team'
  const now = Date.now()
  return NEWS_HEADLINES.map((template, i) => ({
    _id: `mock-${team?.slug || 'team'}-${i}`,
    slug: `placeholder-${team?.slug || 'team'}-${i}`,
    title: template.replace(/{team}/g, name),
    excerpt: `Placeholder summary text so you can see how this card looks with ${name} news filled in — swap this for real tagged articles whenever you\u2019re ready.`,
    category: { name: 'Football', slug: 'football' },
    publishedAt: new Date(now - i * 3 * 60 * 60 * 1000).toISOString(),
    featuredImage: { url: `https://picsum.photos/seed/${team?.slug || 'team'}-${i}/800/450` },
    isBreaking: i === 0,
    tags: [team?.slug].filter(Boolean),
  }))
}

const TABS = [
  { key: 'news',     label: 'News' },
  { key: 'results',  label: 'Results & Fixtures' },
  { key: 'transfers', label: 'Transfers' },
  { key: 'standings', label: 'Standings' },
]

const PAGE_SIZE = 9

// Placeholder data so team pages render even before any teams are
// created in the admin panel / synced from the API. Slugs match the
// fallback list in TeamsDropdown.jsx so every dropdown link resolves.
const DEFAULT_TEAMS = {
  'arsenal':              { name: 'Arsenal',              league: { name: 'Premier League', slug: 'premier-league' } },
  'aston-villa':          { name: 'Aston Villa',          league: { name: 'Premier League', slug: 'premier-league' } },
  'bournemouth':          { name: 'Bournemouth',          league: { name: 'Premier League', slug: 'premier-league' } },
  'brentford':            { name: 'Brentford',            league: { name: 'Premier League', slug: 'premier-league' } },
  'brighton':             { name: 'Brighton',             league: { name: 'Premier League', slug: 'premier-league' } },
  'chelsea':              { name: 'Chelsea',              league: { name: 'Premier League', slug: 'premier-league' } },
  'crystal-palace':       { name: 'Crystal Palace',       league: { name: 'Premier League', slug: 'premier-league' } },
  'everton':              { name: 'Everton',              league: { name: 'Premier League', slug: 'premier-league' } },
  'fulham':               { name: 'Fulham',               league: { name: 'Premier League', slug: 'premier-league' } },
  'ipswich-town':         { name: 'Ipswich Town',         league: { name: 'Premier League', slug: 'premier-league' } },
  'leicester-city':       { name: 'Leicester City',       league: { name: 'Premier League', slug: 'premier-league' } },
  'liverpool':            { name: 'Liverpool',            league: { name: 'Premier League', slug: 'premier-league' } },
  'manchester-city':      { name: 'Manchester City',      league: { name: 'Premier League', slug: 'premier-league' } },
  'manchester-united':    { name: 'Manchester United',    league: { name: 'Premier League', slug: 'premier-league' } },
  'newcastle-united':     { name: 'Newcastle United',     league: { name: 'Premier League', slug: 'premier-league' } },
  'nottingham-forest':    { name: 'Nottingham Forest',    league: { name: 'Premier League', slug: 'premier-league' } },
  'southampton':          { name: 'Southampton',          league: { name: 'Premier League', slug: 'premier-league' } },
  'tottenham-hotspur':    { name: 'Tottenham Hotspur',    league: { name: 'Premier League', slug: 'premier-league' } },
  'west-ham-united':      { name: 'West Ham United',      league: { name: 'Premier League', slug: 'premier-league' } },
  'wolverhampton':        { name: 'Wolverhampton',        league: { name: 'Premier League', slug: 'premier-league' } },
  'leeds-united':         { name: 'Leeds United',         league: { name: 'Championship', slug: 'championship' } },
  'burnley':              { name: 'Burnley',              league: { name: 'Championship', slug: 'championship' } },
  'sheffield-united':     { name: 'Sheffield United',     league: { name: 'Championship', slug: 'championship' } },
  'sunderland':           { name: 'Sunderland',           league: { name: 'Championship', slug: 'championship' } },
  'middlesbrough':        { name: 'Middlesbrough',        league: { name: 'Championship', slug: 'championship' } },
  'west-brom':            { name: 'West Bromwich Albion', league: { name: 'Championship', slug: 'championship' } },
  'coventry-city':        { name: 'Coventry City',        league: { name: 'Championship', slug: 'championship' } },
  'watford':              { name: 'Watford',              league: { name: 'Championship', slug: 'championship' } },
  'stoke-city':           { name: 'Stoke City',           league: { name: 'Championship', slug: 'championship' } },
  'derby-county':         { name: 'Derby County',         league: { name: 'Championship', slug: 'championship' } },
  'real-madrid':          { name: 'Real Madrid',          league: { name: 'La Liga', slug: 'la-liga' } },
  'barcelona':            { name: 'Barcelona',            league: { name: 'La Liga', slug: 'la-liga' } },
  'atletico-madrid':      { name: 'Atletico Madrid',      league: { name: 'La Liga', slug: 'la-liga' } },
  'sevilla':              { name: 'Sevilla',              league: { name: 'La Liga', slug: 'la-liga' } },
  'valencia':             { name: 'Valencia',             league: { name: 'La Liga', slug: 'la-liga' } },
  'villarreal':           { name: 'Villarreal',           league: { name: 'La Liga', slug: 'la-liga' } },
  'bayern-munich':        { name: 'Bayern Munich',        league: { name: 'Bundesliga', slug: 'bundesliga' } },
  'borussia-dortmund':    { name: 'Borussia Dortmund',    league: { name: 'Bundesliga', slug: 'bundesliga' } },
  'rb-leipzig':           { name: 'RB Leipzig',           league: { name: 'Bundesliga', slug: 'bundesliga' } },
  'bayer-leverkusen':     { name: 'Bayer Leverkusen',     league: { name: 'Bundesliga', slug: 'bundesliga' } },
  'juventus':             { name: 'Juventus',             league: { name: 'Serie A', slug: 'serie-a' } },
  'ac-milan':             { name: 'AC Milan',             league: { name: 'Serie A', slug: 'serie-a' } },
  'inter-milan':          { name: 'Inter Milan',          league: { name: 'Serie A', slug: 'serie-a' } },
  'as-roma':              { name: 'AS Roma',              league: { name: 'Serie A', slug: 'serie-a' } },
  'napoli':               { name: 'Napoli',               league: { name: 'Serie A', slug: 'serie-a' } },
  'paris-saint-germain':  { name: 'Paris Saint-Germain',  league: { name: 'Ligue 1', slug: 'ligue-1' } },
  'olympique-lyon':       { name: 'Olympique Lyon',       league: { name: 'Ligue 1', slug: 'ligue-1' } },
  'olympique-marseille':  { name: 'Olympique Marseille',  league: { name: 'Ligue 1', slug: 'ligue-1' } },
  'monaco':               { name: 'Monaco',               league: { name: 'Ligue 1', slug: 'ligue-1' } },
}

function titleCaseFromSlug(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function TabSkeleton({ rows = false }) {
  if (rows) {
    return (
      <div className="mt-6 space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }
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

// ─── Match row (compact, reused for both results & fixtures) ──────
function TeamMatchRow({ fixture, teamSlug }) {
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

// ─── Results & Fixtures tab ────────────────────────────────────────
// Generic opponent names used to build a placeholder fixture list when
// a team has no synced fixtures yet — prefers real teams from the same
// league (via DEFAULT_TEAMS) so it at least looks plausible.
const DEFAULT_OPPONENTS = [
  'Riverside Athletic', 'Ashford Town', 'Kingsmoor FC', 'Whitfield Rovers',
  'Sundale City', 'Ellwood Park', 'Marchvale United', 'Brookfield Albion',
  'Castlemere FC', 'Oldbury Wanderers',
]

function buildDefaultTeamFixtures(team) {
  const sameLeagueOpponents = Object.values(DEFAULT_TEAMS)
    .filter(t => t.league?.name === team.league?.name && t.name !== team.name)
    .map(t => t.name)
  const pool = sameLeagueOpponents.length >= 6 ? sameLeagueOpponents : DEFAULT_OPPONENTS

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  const upcoming = pool.slice(0, 4).map((opp, i) => {
    const isHome = i % 2 === 0
    return {
      _id: `mock-fixture-upcoming-${team.slug}-${i}`,
      homeTeam: isHome ? { name: team.name, logo: team.logo } : { name: opp, logo: '' },
      awayTeam: isHome ? { name: opp, logo: '' } : { name: team.name, logo: team.logo },
      date: new Date(now + (i + 1) * 7 * day).toISOString(),
      status: { short: 'NS' },
      score: { home: null, away: null },
    }
  })

  const past = pool.slice(4, 10).map((opp, i) => {
    const isHome = i % 2 === 1
    const homeGoals = (i * 2 + 1) % 4
    const awayGoals = (i + 2) % 3
    return {
      _id: `mock-fixture-past-${team.slug}-${i}`,
      homeTeam: isHome ? { name: team.name, logo: team.logo } : { name: opp, logo: '' },
      awayTeam: isHome ? { name: opp, logo: '' } : { name: team.name, logo: team.logo },
      date: new Date(now - (i + 1) * 7 * day).toISOString(),
      status: { short: 'FT' },
      score: { home: homeGoals, away: awayGoals },
    }
  })

  return [...upcoming, ...past]
}

// ─── Date helpers (same approach as Results.jsx) ────────────────────
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

function formatSliderDay(d) {
  return {
    weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    date: d.getDate(),
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
  }
}

function formatGroupDate(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ─── Team-scoped date slider — same UX as the Scores page calendar ──
function TeamDateSlider({ selected, onSelect }) {
  const today  = startOfDay(new Date())
  const anchor = startOfDay(selected)
  const days   = buildDays(anchor)
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
          const { weekday, date, month } = formatSliderDay(d)
          return (
            <button
              key={i}
              data-selected={isSelected ? 'true' : undefined}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-center justify-center px-2.5 py-2 rounded-lg shrink-0 min-w-[52px] transition-all ${
                isSelected
                  ? 'bg-primary text-dark'
                  : isToday
                  ? 'bg-gray-100 text-gray-800 font-bold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase leading-tight">{weekday}</span>
              <span className="text-base font-black leading-tight">{date}</span>
              <span className="text-[10px] leading-tight opacity-70">{month}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TeamResultsTab({ team }) {
  const teamSlug = team.slug
  const [fixtures, setFixtures]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))

  // Fetch this team's full fixture list once — filtering by the
  // selected date happens client-side so switching days doesn't need
  // a re-fetch (and mock fallback data still works day-by-day).
  useEffect(() => {
    setLoading(true)
    getFixtures({ team: teamSlug, limit: 100 })
      .then(res => {
        const data = res.data.data || []
        setFixtures(data.length > 0 ? data : buildDefaultTeamFixtures(team))
      })
      .catch(() => setFixtures(buildDefaultTeamFixtures(team)))
      .finally(() => setLoading(false))
  }, [teamSlug])

  const dayFixtures = fixtures
    .filter(f => isSameDay(new Date(f.date), selectedDate))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const dateLabel = formatGroupDate(selectedDate)

  return (
    <div className="mt-6 mx-auto" style={{ maxWidth: 860 }}>
      <TeamDateSlider selected={selectedDate} onSelect={setSelectedDate} />

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
          {dayFixtures.map(f => <TeamMatchRow key={f._id} fixture={f} teamSlug={teamSlug} />)}
        </div>
      )}
    </div>
  )
}

// ─── Sidebar — mirrors CategorySidebar.jsx, but scoped to this team ─
function TeamSidebar({ team, excludeIds = [] }) {
  const [recent, setRecent] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)

  useEffect(() => {
    setRecentLoading(true)
    getTeamFeed(team.slug, { limit: 8 })
      .then(res => {
        const data = res.data.data?.latestNews || []
        const filtered = data.filter(a => !excludeIds.includes(a._id)).slice(0, 6)
        setRecent(filtered.length > 0 ? filtered : buildDefaultTeamArticles(team).slice(6, 12))
      })
      .catch(() => setRecent(buildDefaultTeamArticles(team).slice(6, 12)))
      .finally(() => setRecentLoading(false))
  }, [team.slug, excludeIds.join(',')])

  return (
    <aside className="space-y-8">
      {/* Mini standings for this team's league */}
      {team.league?.slug && (
        <SidebarStandings
          categorySlug="football"
          league={{ slug: team.league.slug, name: team.league.name }}
          highlightTeamName={team.name}
        />
      )}

      {/* Latest stories about this team */}
      <div>
        <h3 className="font-black text-dark text-sm uppercase tracking-widest mb-3 border-t-4 border-dark pt-3">Latest Stories</h3>
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

      <div className="bg-gray-100 rounded-xl h-60 flex items-center justify-center text-gray-400 text-xs font-medium uppercase tracking-widest">
        Advertisement
      </div>
    </aside>
  )
}

// ─── Compact "next match / last result" strip for the News tab ─────
function TeamNewsMatchStrip({ teamSlug }) {
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    getFixtures({ team: teamSlug, limit: 20 })
      .then(res => setFixtures(res.data.data || []))
      .catch(() => setFixtures([]))
      .finally(() => setLoading(false))
  }, [teamSlug])

  if (loading) {
    return (
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  const next = fixtures
    .filter(f => f.status?.short === 'NS')
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
  const last = fixtures
    .filter(f => f.status?.short === 'FT')
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  if (!next && !last) return null

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {next && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Next Match</span>
            </div>
            <TeamMatchRow fixture={next} teamSlug={teamSlug} />
          </div>
        )}
        {last && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Result</span>
            </div>
            <TeamMatchRow fixture={last} teamSlug={teamSlug} />
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

// ─── News tab — same structure as the football News tab: hero + side
// list, top 3-col grid, paginated "Latest News" grid, sticky sidebar ──
function TeamNewsTab({ team }) {
  const teamSlug = team.slug

  const [articles, setArticles]                 = useState([])
  const [loading, setLoading]                   = useState(true)
  const [latestNews, setLatestNews]             = useState([])
  const [latestPage, setLatestPage]             = useState(1)
  const [latestTotalPages, setLatestTotalPages] = useState(1)
  const [latestLoading, setLatestLoading]       = useState(true)
  const [loadingMore, setLoadingMore]           = useState(false)

  // Top set — powers the hero, side list, and top-6 grid.
  // Backed by the real teams-tagging system (Article.teams + isTopStory
  // pins), not string-matching on a tag -- see backend articleController's
  // getTeamFeed / buildEntityFeed.
  useEffect(() => {
    setLoading(true)
    setLatestNews([])
    setLatestPage(1)
    getTeamFeed(teamSlug)
      .then(res => {
        const data = res.data.data?.topStories || []
        setArticles(data.length > 0 ? data : buildDefaultTeamArticles(team))
      })
      .catch(() => setArticles(buildDefaultTeamArticles(team)))
      .finally(() => setLoading(false))
  }, [teamSlug])

  // Paginated "Latest News" set
  useEffect(() => {
    if (latestPage === 1) setLatestLoading(true)
    else setLoadingMore(true)
    getTeamFeed(teamSlug, { limit: 9, page: latestPage })
      .then(res => {
        const incoming = res.data.data?.latestNews || []
        if (incoming.length === 0 && latestPage === 1) {
          // No real articles at all — reuse the mock pool (offset past
          // the hero/side/top-six slice) so "Latest News" isn't empty,
          // and disable further pagination since it's placeholder data.
          setLatestNews(buildDefaultTeamArticles(team).slice(1 + HERO_SIDE_COUNT + BELOW_HERO_COUNT))
          setLatestTotalPages(1)
        } else {
          setLatestNews(prev => latestPage === 1 ? incoming : [...prev, ...incoming])
          setLatestTotalPages(res.data.data?.latestNewsPagination?.pages || 1)
        }
      })
      .catch(() => {})
      .finally(() => { setLatestLoading(false); setLoadingMore(false) })
  }, [teamSlug, latestPage])

  const hero           = articles[0] || null
  const side            = articles.slice(1, 1 + HERO_SIDE_COUNT)
  const topSix          = articles.slice(0, 6)
  const aboveFoldIds    = new Set(articles.map(a => a._id).filter(Boolean))
  const filteredLatest  = latestNews.filter(a => !aboveFoldIds.has(a._id))
  const hasMore         = latestPage < latestTotalPages
  const sidebarExclude  = articles.map(a => a._id).filter(Boolean)

  if (!loading && articles.length === 0 && !latestLoading && latestNews.length === 0) {
    return (
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-sm font-semibold">No news tagged for {team.name} yet.</p>
        <p className="text-gray-400 text-xs mt-1">Articles show up here once tagged with the team name.</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile layout */}
      <div className="md:hidden">
        {!loading && hero && <CategoryHero hero={hero} side={side} />}

        <TeamNewsMatchStrip teamSlug={teamSlug} />

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

          {!loading && team.league?.slug && (
            <div className="mt-10">
              <SidebarStandings
                categorySlug="football"
                league={{ slug: team.league.slug, name: team.league.name }}
                highlightTeamName={team.name}
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop layout — two column */}
      <div className="hidden md:grid md:grid-cols-[1fr_300px] gap-10">
        <div className="min-w-0">
          <AdBanner slotKey="slot_team_rectangle" />

          <div className="mt-6">
            <TeamNewsMatchStrip teamSlug={teamSlug} />
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
            <TeamSidebar team={team} excludeIds={sidebarExclude} />
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Transfers tab (team-tagged articles, transfer-flavoured) ─────

function TeamTransfersTab({ team }) {
  const teamSlug = team.slug
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    getTeamFeed(teamSlug, { limit: 50 })
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
  }, [teamSlug])

  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-sm font-semibold">No transfer news for this team right now.</p>
      </div>
    )
  }

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {articles.map(a => <ArticleCard key={a._id} article={a} />)}
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────
export default function TeamPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'news'

  const [team, setTeam]         = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    api.get(`/teams/${slug}`)
      .then(res => setTeam(res.data.data))
      .catch(() => {
        const fallback = DEFAULT_TEAMS[slug]
        if (fallback) {
          setTeam({ slug, logo: '', ...fallback })
        } else {
          // Unrecognized slug entirely — still render with a generic
          // title-cased name rather than a hard 404, since real team
          // data hasn't been seeded yet.
          setTeam({ slug, name: titleCaseFromSlug(slug), logo: '', league: null })
        }
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
        <title>{team ? `${team.name} — Tave Sports` : 'Team — Tave Sports'}</title>
        <meta name="description" content={team ? `Latest ${team.name} news, fixtures, results and transfers.` : ''} />
      </Helmet>

      {/* Team header + sub-nav — single line, matching the sport sub-nav bar exactly */}
      <div className="bg-surface border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center overflow-x-auto scrollbar-hide md:pl-[var(--subnav-offset)]">
            {loading ? (
              <span className="flex items-center gap-2 pr-3 py-2.5 border-r border-gray-700 mr-1 shrink-0">
                <span className="w-5 h-5 rounded-full bg-gray-700 animate-pulse shrink-0" />
                <span className="h-3 w-20 bg-gray-700 rounded animate-pulse" />
              </span>
            ) : (
              <span className="flex items-center gap-2 pr-3 py-2.5 border-r border-gray-700 mr-1 shrink-0">
                <TeamLogo name={team?.name} logo={team?.logo} className="w-5 h-5" />
                <span className="text-primary font-black text-xs uppercase tracking-widest whitespace-nowrap">
                  {team?.name}
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
          team
            ? <TeamNewsTab team={team} />
            : <TabSkeleton />
        )}
        {activeTab === 'results' && (
          team ? <TeamResultsTab team={team} /> : <TabSkeleton rows />
        )}
        {activeTab === 'transfers' && (
          team ? <TeamTransfersTab team={team} /> : <TabSkeleton />
        )}
        {activeTab === 'standings' && (
          team?.league?.slug ? (
            <div className="max-w-lg mx-auto mt-6">
              <SidebarStandings
                categorySlug="football"
                showFull
                league={{ slug: team.league.slug, name: team.league.name }}
                highlightTeamName={team.name}
              />
            </div>
          ) : team ? (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-sm font-semibold">No league standings available for this team yet.</p>
            </div>
          ) : (
            <TabSkeleton rows />
          )
        )}
      </div>
    </>
  )
}