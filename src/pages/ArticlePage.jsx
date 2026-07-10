import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getArticle, getRelated, formatDate } from '../utils/api'
import { useActiveSport } from '../context/ActiveSportContext'
import ArticleCard from '../components/ui/ArticleCard'
import AdBanner from '../components/ui/AdBanner'
import EmbedHtml from '../components/ui/EmbedHtml'
import Newsletter from '../components/ui/Newsletter'
import ShareButtons from '../components/ui/ShareButtons'
import SidebarWidget from '../components/ui/SidebarWidget'
import { ArticleSkeleton } from '../components/ui/Skeleton'

// Same icon set used across the site's share rows (Transfers page, etc.)
const SHARE_ICONS = [
  {
    label: 'Facebook', bg: 'bg-[#1877F2]',
    getHref: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.94 8.44-9.94z"/></svg>,
  },
  {
    label: 'WhatsApp', bg: 'bg-[#25D366]',
    getHref: (url, title) => `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.9-.4-1.8-1-2.6-1.8-.7-.7-1.3-1.5-1.8-2.4-.1-.3-.1-.5.1-.6.2-.2.5-.5.6-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.6-1 2.6.1 1.1.6 2.2 1.3 3.2 1.4 2 3.2 3.5 5.3 4.5 1 .5 2 .8 3.1.9.7.1 1.4-.1 2-.5.6-.4 1-1.1 1.1-1.8 0-.2 0-.5-.1-.6-.1-.1-.5-.3-.8-.4z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.2L2 22l4.9-1.3C8.3 21.5 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.2-.4-4.6-1.3l-.3-.2-3.3.9.9-3.2-.2-.3C3.6 14.4 3.2 12.7 3.2 11 3.2 6.5 6.5 3.2 11 3.2c4.5 0 8.8 4.3 8.8 8.8 0 4.5-3.3 8.2-7.8 8.2z"/></svg>,
  },
  {
    label: 'Twitter', bg: 'bg-[#1DA1F2]',
    getHref: (url, title) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.9 2H22l-7.1 8.1L23 22h-6.6l-5.2-6.8L5 22H2l7.6-8.7L1.3 2H8l4.7 6.2L18.9 2zm-2.3 18h1.8L7.5 4H5.6l11 16z"/></svg>,
  },
  {
    label: 'Reddit', bg: 'bg-[#FF4500]',
    getHref: (url, title) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12c0-1.1-.9-2-2-2-.5 0-.96.2-1.3.5-1.3-.9-3-1.5-5-1.6l.85-4 2.8.6c0 .8.6 1.5 1.5 1.5.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5c-.6 0-1.1.3-1.3.8l-3.1-.7c-.15 0-.3.1-.35.25l-.95 4.5c-2 .1-3.7.7-5 1.6-.35-.3-.8-.5-1.3-.5-1.1 0-2 .9-2 2 0 .8.5 1.5 1.1 1.8-.05.25-.1.5-.1.75 0 2.5 3.1 4.6 7 4.6s7-2.1 7-4.6c0-.25-.05-.5-.1-.75.6-.3 1.1-1 1.1-1.8zM7.5 13c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5zm7.5 3.5c-.9.6-2.1.9-3 .9s-2.1-.3-3-.9c-.15-.1-.15-.3 0-.4.1-.1.3-.1.4 0 .75.5 1.7.75 2.6.75s1.85-.25 2.6-.75c.1-.1.3-.1.4 0 .1.1.1.3 0 .4zM15 14.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"/></svg>,
  },
  {
    label: 'Email', bg: 'bg-gray-500',
    getHref: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
  },
]

function ImageShareRow({ title, url }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {SHARE_ICONS.map(s => (
        <a key={s.label} href={s.getHref(url, title)} target="_blank" rel="noopener noreferrer"
          className={`w-9 h-9 rounded-full ${s.bg} flex items-center justify-center text-white hover:opacity-90 transition-opacity`}
          aria-label={`Share on ${s.label}`}>
          {s.icon}
        </a>
      ))}
    </div>
  )
}

const formatDateTime = (date) => date ? new Date(date).toLocaleString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
}) : ''

// Splits the article's HTML content into paragraph-level chunks so an
// AdBanner can be dropped in between groups of paragraphs.
function chunkContent(html, perChunk = 3) {
  if (!html) return []
  const parts = html.split(/(<\/p>)/i)
  const paragraphs = []
  let buffer = ''
  for (const part of parts) {
    buffer += part
    if (/<\/p>$/i.test(part)) {
      paragraphs.push(buffer)
      buffer = ''
    }
  }
  if (buffer.trim()) paragraphs.push(buffer)
  if (paragraphs.length === 0) return [html]

  const chunks = []
  for (let i = 0; i < paragraphs.length; i += perChunk) {
    chunks.push(paragraphs.slice(i, i + perChunk).join(''))
  }
  return chunks
}

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
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
    window.scrollTo(0, 0)
    setLoading(true)
    setError(false)
    getArticle(slug)
      .then(res => {
        setArticle(res.data.data)
        return getRelated(res.data.data._id)
      })
      .then(res => setRelated(res.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  // Highlight the sport in the main nav (same one shown on /football, /nba
  // etc.) so it's clear which section this article belongs to, without
  // changing the article's URL. hideSubnav keeps the sport's sub-nav tabs
  // bar (News/Results & Fixtures/Transfers/Teams/Competitions/Table) from
  // showing here — this page has its own News bar + "More News" link below.
  useEffect(() => {
    setForcedSport(article?.category?.slug || null, { hideSubnav: true })
    return () => setForcedSport(null)
  }, [article?.category?.slug, setForcedSport])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <ArticleSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )

  if (error || !article) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-black text-primary mb-4">404</h1>
      <h2 className="text-2xl font-black text-dark mb-3">Article not found</h2>
      <Link to="/" className="text-primary font-semibold hover:underline">← Back to home</Link>
    </div>
  )

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const contentChunks = chunkContent(article.content, 3)

  return (
    <>
      <Helmet>
        <title>{article.seo?.metaTitle || article.title} — Ten Sports</title>
        <meta name="description" content={article.seo?.metaDescription || article.excerpt} />
        {article.featuredImage?.url && <meta property="og:image" content={article.featuredImage.url} />}
        <meta property="og:title" content={article.title} />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Page bar — shows which sport's news this article belongs to, on every screen size */}
      {article.category?.name && (
        <div
          className="sticky z-40 bg-surface border-b border-gray-800 px-4 py-3 flex items-center justify-between"
          style={{ top: navHeight }}
        >
          <span className="text-primary font-black text-sm uppercase tracking-widest">{article.category.name} News</span>
          {article.category.slug && (
            <Link
              to={`/${article.category.slug}`}
              className="text-xs font-bold text-gray-300 hover:text-primary flex items-center gap-1"
            >
              More News →
            </Link>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Article */}
          <article className="lg:col-span-2">
            <h1 className="text-dark font-bold text-2xl md:text-3xl leading-tight mb-3">{article.title}</h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-5">{article.excerpt}</p>

            {/* Author + date/time */}
            <div className="flex items-center justify-between flex-wrap gap-2 py-4 border-y border-gray-200 mb-6">
              <p className="text-sm text-gray-600">Posted by <span className="font-bold text-dark">{article.author?.name}</span></p>
              <p className="text-sm text-gray-400">{formatDateTime(article.publishedAt)}</p>
            </div>

            {/* Featured Image — edge-to-edge on mobile, contained + rounded on desktop.
                Getty embed takes priority when set; it's the licensed image and the
                only content in `featuredImage` when an editor chose the embed route. */}
            {article.featuredImage?.embedHtml ? (
              <figure className="-mx-4 sm:-mx-6 lg:mx-0 mb-6 flex justify-center">
                <EmbedHtml html={article.featuredImage.embedHtml} className="w-full" />
              </figure>
            ) : article.featuredImage?.url && (
              <figure className="-mx-4 sm:-mx-6 lg:mx-0 mb-6">
                <img
                  src={article.featuredImage.url}
                  alt={article.featuredImage.alt || article.title}
                  className="w-full aspect-video lg:rounded-xl object-cover"
                />
              </figure>
            )}

            {/* Share icons under the image */}
            <ImageShareRow title={article.title} url={shareUrl} />

            {/* Content, with an ad dropped between every few paragraphs */}
            <div className="article-content">
              {contentChunks.map((chunk, i) => (
                <div key={i}>
                  <div dangerouslySetInnerHTML={{ __html: chunk }} />
                  {i < contentChunks.length - 1 && (
                    <div className="my-6">
                      <AdBanner slotKey="slot_article_leaderboard" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Embedded Video */}
            {article.embeddedVideo && (
              <div className="mt-8">
                <div className="border-t-4 border-dark pt-3 mb-4">
                  <h3 className="font-black text-dark uppercase tracking-wide text-sm">Watch</h3>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-dark">
                  <iframe src={article.embeddedVideo} className="w-full h-full" allowFullScreen title="Video" />
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <Link key={tag} to={`/search?q=${tag}`}
                      className="bg-gray-100 hover:bg-primary hover:text-dark text-gray-600 text-xs px-3 py-1.5 rounded-full font-medium transition-colors">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share — kept as-is, includes copy link */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Share this article</div>
              <ShareButtons title={article.title} />
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="mt-10">
                <div className="border-t-4 border-dark pt-3 mb-6">
                  <h2 className="font-black text-dark uppercase tracking-wide">Related Stories</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {related.map(a => <ArticleCard key={a._id} article={a} />)}
                </div>
              </div>
            )}

            <div className="mt-10">
              <Newsletter />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            <AdBanner size="rectangle" slotKey="slot_article_rectangle" />
            <SidebarWidget title="Trending Now" />
            <AdBanner size="square" slotKey="slot_article_square" />
            <SidebarWidget title="Latest News" />
          </aside>
        </div>
      </div>
    </>
  )
}