import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// Renders the tabbed "Top Stories" widget from data the home feed already
// computed (see getHomeFeed / articleController). This deliberately does
// NOT fetch its own articles anymore — doing that independently was the
// cause of stories repeating elsewhere on the homepage, since a separate
// fetch here had no idea what the hero/side/latest sections already used.
export default function TopStories({ topStoriesByCategory = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef(null)

  const tabs = topStoriesByCategory.filter(t => t.articles.length > 0)

  useEffect(() => {
    if (activeIndex >= tabs.length) setActiveIndex(0)
  }, [tabs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  if (tabs.length === 0) return null
  const active = tabs[activeIndex]

  return (
    <div className="mb-10 bg-dark rounded-none sm:rounded-xl -mx-4 sm:mx-0 px-4 sm:px-6 py-6 relative">
      <h2 className="text-white font-black text-xl sm:text-2xl mb-4">Top Stories</h2>

      {/* Tabs */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-gray-800 mb-5 pb-px">
        {tabs.map((t, i) => (
          <button
            key={t.category._id}
            onClick={() => setActiveIndex(i)}
            className={`whitespace-nowrap pb-2 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${
              i === activeIndex
                ? 'text-primary border-primary'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {t.category.name}
          </button>
        ))}
      </div>

      {/* Cards row */}
      <div className="relative">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x">
          {active.articles.map(article => (
            <Link
              key={article._id}
              to={`/article/${article.slug}`}
              className="group flex-shrink-0 w-[220px] sm:w-[240px] snap-start"
            >
              <div className="aspect-video rounded-lg overflow-hidden bg-surface mb-2">
                {article.featuredImage?.url
                  ? <img src={article.featuredImage.url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full bg-gradient-to-br from-surface to-gray-900 flex items-center justify-center text-gray-700 text-xs">No Image</div>
                }
              </div>
              <h4 className="text-white text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
            </Link>
          ))}
        </div>

        {active.articles.length > 3 && (
          <button
            onClick={() => scroll(1)}
            className="hidden md:flex items-center justify-center absolute -right-3 top-[72px] w-9 h-9 rounded-full bg-primary text-dark shadow-lg hover:scale-105 transition-transform"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}