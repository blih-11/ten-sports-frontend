import { Link } from 'react-router-dom'
import { timeAgo, truncate, cardImage, cardEmbedHtml } from '../../utils/api'
import EmbedHtml from './EmbedHtml'

// Shared thumbnail renderer: a responsive embed (SmartFrame, etc.) takes
// priority when set, then a regular image, then a plain placeholder block.
// className should include sizing (w-full h-full and similar).
// For big/full-width displays (hero slots) -- unlike CardThumb, this
// prioritizes the FULL embed or full-size photo over the small card
// thumbnail. Using cardImage()'s thumbnail-first priority for a hero was
// the cause of blurry, wrong-aspect hero images: a thumbnail meant for an
// 80-112px card was getting stretched across a 400px+ tall hero instead
// of showing the actual full-resolution image.
export function HeroThumb({ article, className, placeholderClass, placeholderText }) {
  const fi = article?.featuredImage
  const embedHtml = fi?.embedHtml || fi?.thumbnailEmbedHtml
  if (embedHtml) return <div className={className}><EmbedHtml html={embedHtml} className="w-full h-full" /></div>
  const img = fi?.url || fi?.thumbnailUrl
  if (img) return <img src={img} alt={article.title} className={className} />
  return <div className={placeholderClass || className}>{placeholderText}</div>
}

export function CardThumb({ article, className, placeholderClass, placeholderText }) {
  const embedHtml = cardEmbedHtml(article)
  if (embedHtml) return <div className={className}><EmbedHtml html={embedHtml} className="w-full h-full" /></div>
  const img = cardImage(article)
  if (img) return <img src={img} alt={article.title} className={className} />
  return <div className={placeholderClass || className}>{placeholderText}</div>
}

export default function ArticleCard({ article, variant = 'default', hideCategory = false }) {
  if (!article) return null

  if (variant === 'featured') return (
    <Link to={`/article/${article.slug}`} className="group block relative overflow-hidden rounded-xl bg-dark">
      {/* `isolate` contains any z-index used *inside* this box (harmless to
          keep), but it can't help against SmartFrame specifically: SmartFrame
          runs as a real Web Component directly in the main document (unlike
          Getty's iframe below), and widgets built that way commonly render
          their zoom/fullscreen/error overlay by appending it straight to
          <body> with `position: fixed`. An element appended to <body> is not
          a descendant of this box at all, so no local stacking-context trick
          can contain it -- it competes directly at the document root, where
          whichever sibling has the higher raw z-index wins. That's why the
          headline was still losing after adding `isolate` alone. */}
      <div className="relative isolate aspect-video bg-surface overflow-hidden">
        <HeroThumb
          article={article}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          placeholderClass="w-full h-full bg-gradient-to-br from-surface to-gray-900 flex items-center justify-center text-gray-700 text-sm"
          placeholderText="No Image"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>
      {/* z-index set high enough to outrank a body-appended third-party
          overlay at the document root, since containment (isolate) alone
          can't reach something that isn't our descendant. */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-[2147483647]">
        {article.isBreaking && <span className="bg-primary text-dark text-xs font-bold px-2 py-0.5 rounded mb-2 inline-block">BREAKING</span>}
        <span className="bg-primary/90 text-dark text-xs font-bold px-2 py-0.5 rounded mb-2 inline-block ml-1">{article.category?.name}</span>
        <h2 className="text-white font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">{article.title}</h2>
        <p className="text-gray-400 text-sm mt-1">{timeAgo(article.publishedAt)}</p>
      </div>
    </Link>
  )

  if (variant === 'horizontal') return (
    <Link to={`/article/${article.slug}`} className="group flex gap-3 hover:bg-surface rounded-lg p-2 -mx-2 transition-colors">
      <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <CardThumb
          article={article}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          placeholderClass="w-full h-full bg-gray-200"
        />
      </div>
      <div className="flex-1 min-w-0">
        {!hideCategory && <span className="text-primary text-xs font-bold uppercase">{article.category?.name}</span>}
        <h3 className="text-gray-900 text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-gray-400 text-xs mt-1">{timeAgo(article.publishedAt)}</p>
      </div>
    </Link>
  )

  // transfer variant — Sky Sports card style
  if (variant === 'transfer') return (
    <Link to={`/article/${article.slug}`} className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video overflow-hidden bg-gray-100">
        <CardThumb
          article={article}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          placeholderClass="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center text-gray-400 text-xs"
          placeholderText="No Image"
        />
      </div>
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-gray-900 font-bold text-sm leading-snug line-clamp-3 group-hover:text-primary transition-colors">{article.title}</h3>
          <p className="text-gray-400 text-xs mt-2">{timeAgo(article.publishedAt)}</p>
        </div>
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary transition-colors flex items-center justify-center mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-gray-500 group-hover:text-dark transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )

  // default variant — category label beside date
  return (
    <Link to={`/article/${article.slug}`} className="group block">
      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3">
        <CardThumb
          article={article}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          placeholderClass="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center text-gray-400 text-xs"
          placeholderText="No Image"
        />
      </div>
      <div className="space-y-1.5">
        {article.isBreaking && <span className="bg-primary text-dark text-xs font-bold px-2 py-0.5 rounded inline-block">BREAKING</span>}
        <h3 className="text-gray-900 font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-gray-500 text-sm line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {!hideCategory && (
            <>
              <span className="text-primary font-bold uppercase">{article.category?.name}</span>
              <span>·</span>
            </>
          )}
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  )
}