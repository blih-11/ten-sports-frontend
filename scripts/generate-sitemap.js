// Generates public/sitemap.xml from live content before every build, and
// patches the Sitemap: line in public/robots.txt with the real site URL.
// Runs as a plain Node script (see package.json's "build" script), so it
// reads process.env directly -- import.meta.env only exists inside code
// Vite itself processes, not here.
import { writeFileSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '..', 'public')

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api'
const SITE_URL = (process.env.VITE_SITE_URL || 'https://tensport.netlify.app').replace(/\/$/, '')

const STATIC_PATHS = ['/', '/about', '/contact', '/transfer-news']

const xmlEscape = (s = '') => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const urlEntry = (path, lastmod) => `  <url>
    <loc>${xmlEscape(SITE_URL + path)}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
  </url>`

async function main() {
  const urls = STATIC_PATHS.map(p => urlEntry(p))

  try {
    const catsRes = await fetch(`${API_URL}/categories`)
    const cats = catsRes.ok ? (await catsRes.json()).data || [] : []
    for (const cat of cats) {
      if (cat.slug) urls.push(urlEntry(`/${cat.slug}`))
    }
  } catch (e) {
    console.warn('[sitemap] Could not fetch categories, skipping category URLs:', e.message)
  }

  try {
    // Pull every published article. If your article count grows well past a
    // few thousand, switch this to paginate and/or split into multiple
    // sitemap files referenced from a sitemap index -- a single file is
    // fine for now.
    const artRes = await fetch(`${API_URL}/articles?limit=5000&page=1`)
    const articles = artRes.ok ? (await artRes.json()).data || [] : []
    for (const a of articles) {
      if (a.slug) urls.push(urlEntry(`/article/${a.slug}`, a.updatedAt || a.publishedAt))
    }
    console.log(`[sitemap] ${articles.length} article URLs included.`)
  } catch (e) {
    console.warn('[sitemap] Could not fetch articles -- sitemap will only have static + category URLs:', e.message)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(urls)].join('\n')}
</urlset>
`
  writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), xml)
  console.log(`[sitemap] Wrote public/sitemap.xml with ${new Set(urls).size} URLs.`)

  // Patch the Sitemap: line in robots.txt with the real site URL.
  try {
    const robotsPath = join(PUBLIC_DIR, 'robots.txt')
    const robots = readFileSync(robotsPath, 'utf8').replace('__SITE_URL__', SITE_URL)
    writeFileSync(robotsPath, robots)
  } catch (e) {
    console.warn('[sitemap] Could not patch robots.txt:', e.message)
  }
}

main()
