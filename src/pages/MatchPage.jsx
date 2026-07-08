import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../utils/api'
import { useActiveSport } from '../context/ActiveSportContext'
import TeamLogo from '../components/ui/TeamLogo'

function StatBar({ label, home, away }) {
  const total = (home || 0) + (away || 0)
  const homeWidth = total > 0 ? Math.round(((home || 0) / total) * 100) : 50
  const awayWidth = 100 - homeWidth

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm font-bold text-white mb-1">
        <span>{home ?? 0}</span>
        <span className="text-gray-400 text-xs uppercase tracking-wide">{label}</span>
        <span>{away ?? 0}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-800">
        <div className="bg-primary transition-all" style={{ width: `${homeWidth}%` }} />
        <div className="bg-gray-600 transition-all" style={{ width: `${awayWidth}%` }} />
      </div>
    </div>
  )
}

function EventIcon({ type, detail }) {
  if (type === 'Goal') return (
    <span title={detail} className="inline-flex">
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
        <path strokeWidth={1.2} d="M12 6l3 2.2-1.1 3.6H10.1L9 8.2z" fill="currentColor" />
      </svg>
    </span>
  )
  if (type === 'Card' && detail?.includes('Yellow')) return <span title="Yellow Card" className="inline-block w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
  if (type === 'Card' && detail?.includes('Red')) return <span title="Red Card" className="inline-block w-2.5 h-3.5 bg-red-600 rounded-sm" />
  if (type === 'subst') return (
    <span title="Substitution" className="inline-flex">
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h13m0 0l-4-4m4 4l-4 4M20 17H7m0 0l4 4m-4-4l4-4" />
      </svg>
    </span>
  )
  return <span>•</span>
}

// League.sport values don't all line up 1:1 with the nav's sport slugs —
// normalize the ones that differ.
const SPORT_SLUG_MAP = { basketball: 'nba', formula1: 'formula-1' }
const SPORT_LABELS = {
  football: 'Football', tennis: 'Tennis', 'formula-1': 'Formula 1',
  nfl: 'NFL', nba: 'NBA', rugby: 'Rugby', golf: 'Golf', boxing: 'Boxing',
}

export default function MatchPage() {
  const { id } = useParams()
  const [fixture, setFixture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('events')
  const [navHeight, setNavHeight] = useState(0)
  const { setForcedSport } = useActiveSport()

  useEffect(() => {
    const header = document.querySelector('header')
    const measure = () => setNavHeight(header ? header.offsetHeight : 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    api.get(`/fixtures/${id}`)
      .then(res => setFixture(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const sportSlug = fixture ? (SPORT_SLUG_MAP[fixture.league?.sport] || fixture.league?.sport || 'football') : null

  // Activate the sport's sub-nav bar on desktop, same as the article page.
  useEffect(() => {
    setForcedSport(sportSlug)
    return () => setForcedSport(null)
  }, [sportSlug, setForcedSport])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="space-y-4">
        <div className="h-48 bg-dark rounded-2xl animate-pulse" />
        <div className="h-64 bg-dark rounded-2xl animate-pulse" />
      </div>
    </div>
  )

  if (!fixture) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-400 text-lg">Match not found</p>
      <Link to="/results" className="text-primary text-sm mt-3 inline-block hover:underline">← Back to Results</Link>
    </div>
  )

  const isFinished = fixture.status?.short === 'FT'
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixture.status?.short)
  const hasLineups = fixture.lineups?.home?.startXI?.length > 0
  const hasStats = Object.keys(fixture.stats?.home || {}).length > 0
  const hasEvents = fixture.events?.length > 0

  const tabs = [
    { key: 'events',  label: 'Match Events', show: hasEvents },
    { key: 'lineups', label: 'Line-ups',      show: hasLineups },
    { key: 'stats',   label: 'Stats',         show: hasStats },
  ].filter(t => t.show)

  const homeEvents = fixture.events?.filter(e => e.team === fixture.homeTeam?.name) || []
  const awayEvents = fixture.events?.filter(e => e.team === fixture.awayTeam?.name) || []

  return (
    <>
      <Helmet>
        <title>{fixture.homeTeam?.name} vs {fixture.awayTeam?.name} — Ten Sports</title>
      </Helmet>

      {/* Mobile page bar — sticky, shows which sport's results this match belongs to */}
      <div
        className="lg:hidden sticky z-40 bg-surface border-b border-gray-800 px-4 py-3"
        style={{ top: navHeight }}
      >
        <span className="text-primary font-black text-sm uppercase tracking-widest">
          {SPORT_LABELS[sportSlug] || 'Football'} Results
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/football?tab=results" className="text-gray-500 text-sm hover:text-primary transition-colors mb-6 inline-block">
          ← Back to Results
        </Link>

        {/* Match card — score, events, tabs and fallback all live in this single box */}
        <div className="bg-dark rounded-2xl overflow-hidden mb-6">
          <div className="bg-darker px-6 py-3 flex items-center justify-between">
            <span className="text-gray-400 text-xs font-semibold">{fixture.league?.name}</span>
            <span className="text-gray-500 text-xs">{fixture.round}</span>
          </div>

          <div className="px-6 py-8">
            <div className="flex items-center justify-between gap-4">
              {/* Home */}
              <div className="flex-1 text-center">
                <TeamLogo name={fixture.homeTeam?.name} className="w-16 h-16 mx-auto mb-3" />
                <h2 className="text-white font-bold text-lg leading-tight">{fixture.homeTeam?.name}</h2>
                {hasLineups && <p className="text-gray-500 text-xs mt-1">{fixture.lineups.home.formation}</p>}
              </div>

              {/* Score */}
              <div className="text-center shrink-0 px-4">
                {(isFinished || isLive) ? (
                  <div className="flex items-center gap-3">
                    <span className={`text-5xl font-black ${isLive ? 'text-primary' : 'text-white'}`}>
                      {fixture.score?.home ?? 0}
                    </span>
                    <span className="text-gray-600 text-2xl font-light">—</span>
                    <span className={`text-5xl font-black ${isLive ? 'text-primary' : 'text-white'}`}>
                      {fixture.score?.away ?? 0}
                    </span>
                  </div>
                ) : (
                  <div className="text-white text-2xl font-black">
                    {new Date(fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                <div className="mt-2">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 bg-primary/20 text-primary text-xs font-black px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      LIVE {fixture.status?.elapsed}'
                    </span>
                  ) : isFinished ? (
                    <span className="text-gray-500 text-xs font-semibold">
                      Full Time
                      {fixture.score?.htHome != null && (
                        <span className="ml-2 text-gray-600">HT: {fixture.score.htHome}–{fixture.score.htAway}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">
                      {new Date(fixture.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Away */}
              <div className="flex-1 text-center">
                <TeamLogo name={fixture.awayTeam?.name} className="w-16 h-16 mx-auto mb-3" />
                <h2 className="text-white font-bold text-lg leading-tight">{fixture.awayTeam?.name}</h2>
                {hasLineups && <p className="text-gray-500 text-xs mt-1">{fixture.lineups.away.formation}</p>}
              </div>
            </div>
          </div>

          {/* Goal events summary under score */}
          {hasEvents && (
            <div className="px-6 pb-6 flex justify-between text-xs text-gray-400">
              <div className="space-y-1">
                {homeEvents.filter(e => e.type === 'Goal').map((e, i) => (
                  <p key={i} className="flex items-center gap-1"><EventIcon type="Goal" /> {e.player} <span className="text-gray-600">{e.minute}'</span></p>
                ))}
              </div>
              <div className="space-y-1 text-right">
                {awayEvents.filter(e => e.type === 'Goal').map((e, i) => (
                  <p key={i} className="flex items-center justify-end gap-1"><span className="text-gray-600">{e.minute}'</span> {e.player} <EventIcon type="Goal" /></p>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          {tabs.length > 0 && (
            <div className="border-t border-gray-800">
              <div className="flex border-b border-gray-800">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-4 py-3 text-sm font-bold transition-all ${
                      activeTab === tab.key
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
              {/* Events tab */}
              {activeTab === 'events' && hasEvents && (
                <div className="space-y-2">
                  {fixture.events.map((event, i) => {
                    const isHome = event.team === fixture.homeTeam?.name
                    return (
                      <div key={i} className={`flex items-center gap-3 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`flex-1 ${isHome ? 'text-left' : 'text-right'}`}>
                          <span className="text-white text-sm font-semibold">{event.player}</span>
                          {event.assist && <span className="text-gray-500 text-xs ml-1">({event.assist})</span>}
                          <p className="text-gray-500 text-xs">{event.detail}</p>
                        </div>
                        <div className="shrink-0 flex flex-col items-center">
                          <EventIcon type={event.type} detail={event.detail} />
                          <span className="text-gray-600 text-xs">{event.minute}'</span>
                        </div>
                        <div className="flex-1" />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Lineups tab */}
              {activeTab === 'lineups' && hasLineups && (
                <div className="grid grid-cols-2 gap-8">
                  {['home', 'away'].map(side => (
                    <div key={side}>
                      <h3 className="text-primary text-xs font-black uppercase tracking-widest mb-3">
                        {side === 'home' ? fixture.homeTeam?.name : fixture.awayTeam?.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-3">
                        {fixture.lineups[side].formation} · Coach: {fixture.lineups[side].coach}
                      </p>
                      <div className="space-y-1.5">
                        {fixture.lineups[side].startXI.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-6 h-6 bg-surface rounded-full flex items-center justify-center text-xs text-gray-400 font-bold shrink-0">
                              {p.number}
                            </span>
                            <span className="text-white">{p.name}</span>
                            <span className="text-gray-600 text-xs">{p.position}</span>
                          </div>
                        ))}
                      </div>
                      {fixture.lineups[side].substitutes?.length > 0 && (
                        <>
                          <p className="text-gray-600 text-xs mt-4 mb-2 uppercase tracking-wide">Subs</p>
                          <div className="space-y-1.5">
                            {fixture.lineups[side].substitutes.map((p, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="w-6 h-6 bg-surface rounded-full flex items-center justify-center text-xs text-gray-600 shrink-0">
                                  {p.number}
                                </span>
                                <span className="text-gray-400">{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Stats tab */}
              {activeTab === 'stats' && hasStats && (
                <div className="space-y-2">
                  {Object.entries(fixture.stats.home).map(([key, homeVal]) => (
                    <StatBar
                      key={key}
                      label={key.replace(/_/g, ' ')}
                      home={homeVal}
                      away={fixture.stats.away?.get ? fixture.stats.away.get(key) : fixture.stats.away?.[key]}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {tabs.length === 0 && (
            <div className="border-t border-gray-800 px-6 py-10 text-center">
              <p className="text-gray-400 text-sm">No detailed match data — goals, cards, line-ups or stats — is available for this game yet.</p>
            </div>
          )}
        </div>

        {fixture.venue && (
          <p className="text-gray-600 text-xs text-center mt-4 flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {fixture.venue}
          </p>
        )}
      </div>
    </>
  )
}