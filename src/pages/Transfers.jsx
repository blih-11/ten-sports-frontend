import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getArticles, getCategories, timeAgo } from '../utils/api'
import { HeroThumb } from '../components/ui/ArticleCard'
import TransfersTab from '../components/ui/TransfersTab'
import AdBanner from '../components/ui/AdBanner'

export default function Transfers() {
  const [category, setCategory] = useState(null)
  const [hero, setHero] = useState(null)
  const [loading, setLoading] = useState(true)
  const [navHeight, setNavHeight] = useState(0)

  useEffect(() => {
    const header = document.querySelector('header')
    const measure = () => setNavHeight(header ? header.offsetHeight : 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)

    getCategories()
      .then(res => {
        const categories = res.data.data || []
        const football = categories.find(c => c.slug === 'football')
        setCategory(football || null)
        if (!football) return null
        return getArticles({ category: football._id, tag: 'transfer', limit: 1, page: 1 })
      })
      .then(res => {
        if (res) setHero((res.data.data || [])[0] || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Helmet>
        <title>Transfers — Ten Sports</title>
        <meta name="description" content="Football Transfer News, Updates and Rumours from Ten Sports." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile page bar — sticky, shows we're in Transfer News, carries the share icons */}
        <div
          className="md:hidden sticky z-40 -mx-4 -mt-8 mb-6 bg-surface border-b border-gray-800 px-4 py-3 flex items-center justify-between"
          style={{ top: navHeight }}
        >
          <span className="text-primary font-black text-sm uppercase tracking-widest">Transfer News</span>
          <div className="flex items-center gap-2">
            {[
              { href: 'https://facebook.com/sharer', bg: 'bg-[#1877F2]', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.94 8.44-9.94z"/></svg> },
              { href: 'https://x.com/intent/tweet', bg: 'bg-black', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.9 2H22l-7.1 8.1L23 22h-6.6l-5.2-6.8L5 22H2l7.6-8.7L1.3 2H8l4.7 6.2L18.9 2zm-2.3 18h1.8L7.5 4H5.6l11 16z"/></svg> },
              { href: 'https://wa.me/?text=', bg: 'bg-[#25D366]', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.9-.4-1.8-1-2.6-1.8-.7-.7-1.3-1.5-1.8-2.4-.1-.3-.1-.5.1-.6.2-.2.5-.5.6-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.6-1 2.6.1 1.1.6 2.2 1.3 3.2 1.4 2 3.2 3.5 5.3 4.5 1 .5 2 .8 3.1.9.7.1 1.4-.1 2-.5.6-.4 1-1.1 1.1-1.8 0-.2 0-.5-.1-.6-.1-.1-.5-.3-.8-.4z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.2L2 22l4.9-1.3C8.3 21.5 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.2-.4-4.6-1.3l-.3-.2-3.3.9.9-3.2-.2-.3C3.6 14.4 3.2 12.7 3.2 11 3.2 6.5 6.5 3.2 11 3.2c4.5 0 8.8 4.3 8.8 8.8 0 4.5-3.3 8.2-7.8 8.2z"/></svg> },
              { href: 'mailto:?subject=Transfer News', bg: 'bg-gray-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
            ].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                className={`w-6 h-6 rounded-full ${s.bg} flex items-center justify-center text-white hover:opacity-90 transition-opacity`}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

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
                    <h2 className="text-white font-bold text-2xl leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-1">{hero.title}</h2>
                    <p className="text-gray-400 text-xs mt-2">{timeAgo(hero.publishedAt)}</p>
                  </div>
                </Link>
                <div className="flex flex-col gap-4">
                  <AdBanner size="rectangle" slotKey="slot_transfers_rectangle" />
                </div>
              </div>
            </div>
          </>
        )}

        <TransfersTab categoryId={category?._id} excludeId={hero?._id} />
      </div>
    </>
  )
}