import { Link } from 'react-router-dom'
import ArticleCard, { HeroThumb, CardThumb } from './ArticleCard'
import { timeAgo } from '../../utils/api'

export default function CategoryHero({ hero, side = [] }) {
  if (!hero && side.length === 0) return null

  return (
    <>
      {/* Desktop hero — unchanged, same as home page */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4 mb-10">
        <div className="lg:col-span-2">
          {hero && <ArticleCard article={hero} variant="featured" />}
        </div>
        <div className="space-y-3">
          {side.slice(0, 4).map(article => (
            <ArticleCard key={article._id} article={article} variant="horizontal" />
          ))}
        </div>
      </div>

      {/* Mobile hero — full-bleed image with overlay, same style as the Home page hero */}
      <div className="lg:hidden -mt-8 -mx-4 sm:-mx-6 mb-6">
        {hero && (
          <Link to={`/article/${hero.slug}`} className="group block relative">
            <div className="w-full h-[300px] sm:h-[380px] overflow-hidden">
              <HeroThumb article={hero} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" placeholderClass="w-full h-full bg-surface" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4">
              {hero.isBreaking && (
                <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-primary text-dark px-2 py-0.5 rounded mb-2">
                  BREAKING
                </span>
              )}
              <h2 className="text-lg font-bold leading-snug text-white group-hover:text-primary transition-colors line-clamp-3 mb-1">
                {hero.title}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">{hero.category?.name}</span>
                <span className="text-gray-500 text-xs">·</span>
                <span className="text-xs text-gray-400">{timeAgo(hero.publishedAt)}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Side news — separated from the hero by a border line only, no gap, still full black */}
        <div className="bg-dark divide-y divide-gray-800 px-4 sm:px-6 border-t border-gray-700">
          {side.slice(0, 12).map(a => (
            <Link key={a._id} to={`/article/${a.slug}`} className="group flex items-center gap-4 py-4">
              <div className="w-28 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-surface">
                <CardThumb article={a} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" placeholderClass="w-full h-full bg-surface" />
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
  )
}