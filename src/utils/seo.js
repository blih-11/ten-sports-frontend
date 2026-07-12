// Absolute site URL, needed for canonical links, og:url and og:image
// (search engines and social crawlers require absolute URLs, not relative
// paths). Set VITE_SITE_URL in your .env for each environment (e.g.
// https://tensports.com in prod) -- falls back to whatever origin the app
// is actually running on if it's not set.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')

// Build an absolute canonical URL for a given in-app path.
// canonicalUrl('/football') -> 'https://tensports.com/football'
export const canonicalUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
