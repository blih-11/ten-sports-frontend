import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

export const getArticles = (params = {}) => api.get('/articles', { params })
export const getArticle = (slug) => api.get(`/articles/${slug}`)
export const getRelated = (id) => api.get(`/articles/${id}/related`)
export const getCategories = () => api.get('/categories')
export const getNavItems = () => api.get('/nav-items')
export const getHomeFeed = (params = {}) => api.get('/articles/feed/home', { params })
export const getTeamFeed = (slug, params = {}) => api.get(`/articles/feed/team/${slug}`, { params })
export const getCompetitionFeed = (slug, params = {}) => api.get(`/articles/feed/competition/${slug}`, { params })
export const getPageSections = (page) => api.get(`/page-sections/${page}`)
export const subscribe = (email) => api.post('/newsletter/subscribe', { email })

export const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric'
})

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return formatDate(date)
}

export const truncate = (str, n) => str?.length > n ? str.slice(0, n) + '...' : str

// Card/thumbnail image for an article. Getty's embed widget can't be
// cropped into a small card, so when an article uses a Getty embed as its
// featured image, its separate `thumbnailUrl` (a normal uploaded image) is
// what list/card views should show instead of the embed.
export const cardImage = (entity) => entity?.featuredImage?.thumbnailUrl || entity?.featuredImage?.url || ''
// Responsive thumbnail embed (e.g. SmartFrame) takes priority over cardImage
// when set. Falls back to the full featuredImage embed as a last resort
// (only when there's neither a dedicated thumbnail NOR a plain uploaded
// image) -- an imperfectly-cropped embed at card size still beats
// rendering a blank "No Image" box.
export const cardEmbedHtml = (entity) => entity?.featuredImage?.thumbnailEmbedHtml || entity?.featuredImage?.embedHtml || ''

export const getStandings = (leagueSlug) => api.get('/standings', { params: { leagueSlug } })
export const getFixtures = (params = {}) => api.get('/fixtures', { params })
export const getFixture = (id) => api.get(`/fixtures/${id}`)

export const readTime = (content = '') => {
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export default api
