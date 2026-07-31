// Absolute site URL, needed for canonical links, og:url and og:image
// (search engines and social crawlers require absolute URLs, not relative
// paths). Set VITE_SITE_URL in your .env for each environment (e.g.
// https://tavesports.com in prod) -- falls back to whatever origin the app
// is actually running on if it's not set.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')

// Build an absolute canonical URL for a given in-app path.
// canonicalUrl('/football') -> 'https://tavesports.com/football'
export const canonicalUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

// Social platforms have much stricter image requirements than the site
// itself does -- X in particular will silently drop a card (no fallback,
// no broken-image icon, just nothing) if the image is too large, the wrong
// aspect ratio, or an unsupported format. Cloudinary-hosted images (which
// is everything uploaded through the admin) can be resized/re-encoded on
// the fly just by adding a transformation segment to the URL, so we always
// request a properly-sized, compressed, auto-format version specifically
// for og:image/twitter:image -- the original upload is left untouched and
// still used everywhere else (article body, cards, thumbnails).
//
// Target: 1200x630 (the de-facto standard social card size, ~1.91:1,
// which is also what X recommends), auto format (serves WebP/AVIF to
// clients that support it, JPG otherwise) and auto quality (Cloudinary
// picks the smallest file that still looks good) -- keeps every card
// safely under X's 5MB limit regardless of how large the original upload
// was.
export const socialImageUrl = (url = '') => {
  if (!url) return url
  const marker = '/image/upload/'
  const i = url.indexOf(marker)
  if (i === -1) return url // not a Cloudinary URL (e.g. a manually-pasted external link) -- leave as-is
  const transform = 'w_1200,h_630,c_fill,g_auto,f_auto,q_auto'
  return `${url.slice(0, i + marker.length)}${transform}/${url.slice(i + marker.length)}`
}
