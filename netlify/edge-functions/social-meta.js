// Serves server-rendered <head> meta tags (og:image, og:title, etc.) to
// social-media link-preview bots. Real users are untouched — this function
// only intervenes when the request comes from a known crawler UA; every
// other request is passed straight through to the normal SPA via
// context.next(), so there is no change to app behaviour or performance
// for humans.
//
// WHY THIS EXISTS: this app is a client-side-only Vite/React SPA. Its
// og:title / og:image tags are injected into <head> by react-helmet-async,
// which only runs after the JS bundle has loaded and executed in a real
// browser. Facebook, X, Instagram (via Facebook's crawler), WhatsApp,
// Slack, Discord, etc. fetch the raw HTML once and do NOT execute
// JavaScript, so they only ever saw the generic static index.html shell —
// meaning no article/team/match ever got a working preview image,
// regardless of what was set in the admin panel.

const BOT_UA_REGEX =
  /facebookexternalhit|Facebot|Twitterbot|Slackbot|WhatsApp|LinkedInBot|TelegramBot|Discordbot|Pinterest|SkypeUriPreview|redditbot|Applebot|Google-InspectionTool|vkShare|W3C_Validator|Embedly|Iframely|Quora Link Preview/i;

const SITE_NAME = 'Tave Sports';
const DEFAULT_TITLE = 'Tave Sports — Football, Basketball & More';
const DEFAULT_DESCRIPTION =
  'Your number one source for football, basketball, tennis and all things sports.';

export default async (request, context) => {
  const userAgent = request.headers.get('user-agent') || '';

  // Not a bot -> don't touch the response at all.
  if (!BOT_UA_REGEX.test(userAgent)) {
    return context.next();
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const origin = url.origin;

  const apiUrl = (Deno.env.get('API_URL') || Deno.env.get('VITE_API_URL') || '').replace(/\/$/, '');
  const defaultImage = `${origin}/favicon.png`;

  let meta = {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    image: defaultImage,
    type: 'website',
  };

  try {
    if (path.startsWith('/article/')) {
      meta = await buildArticleMeta(apiUrl, path.slice('/article/'.length), defaultImage, meta);
    } else if (path.startsWith('/team/')) {
      meta = await buildTeamMeta(apiUrl, path.slice('/team/'.length), defaultImage, meta);
    } else if (path.startsWith('/match/')) {
      meta = await buildMatchMeta(apiUrl, path.slice('/match/'.length), defaultImage, meta);
    } else if (path === '/results') {
      meta = {
        title: `Scores & Fixtures — ${SITE_NAME}`,
        description: 'Live scores, fixtures and results across all sports.',
        image: defaultImage,
        type: 'website',
      };
    } else if (path === '/transfer-news' || path === '/transfers') {
      meta = {
        title: `Transfers — ${SITE_NAME}`,
        description: 'Football Transfer News, Updates and Rumours from Tave Sports.',
        image: defaultImage,
        type: 'website',
      };
    } else if (path === '/about') {
      meta = { title: `About Us — ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, image: defaultImage, type: 'website' };
    } else if (path === '/contact') {
      meta = { title: `Contact — ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, image: defaultImage, type: 'website' };
    } else if (path === '/privacy') {
      meta = { title: `Privacy Policy — ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, image: defaultImage, type: 'website' };
    } else if (path === '/terms') {
      meta = { title: `Terms of Use — ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, image: defaultImage, type: 'website' };
    } else if (path === '/search') {
      meta = { title: `Search — ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, image: defaultImage, type: 'website' };
    } else if (path === '/') {
      // defaults above are already correct for home
    } else if (/^\/[a-z0-9-]+\/?$/i.test(path)) {
      // Everything else single-segment is a category page (catch-all route)
      meta = await buildCategoryMeta(apiUrl, path.replace(/^\/|\/$/g, ''), defaultImage, meta);
    }
  } catch (err) {
    console.error('[social-meta] failed, falling back to defaults:', err);
  }

  const html = renderHtml(meta, `${origin}${path}`);
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
};

async function buildArticleMeta(apiUrl, slug, defaultImage, fallback) {
  if (!apiUrl) return fallback;
  const res = await fetch(`${apiUrl}/articles/${slug}`);
  if (!res.ok) return fallback;
  const { data: article } = await res.json();
  if (!article) return fallback;

  const image =
    article.socialImage?.url ||
    article.featuredImage?.thumbnailUrl ||
    article.featuredImage?.url ||
    defaultImage;

  return {
    title: `${article.seo?.metaTitle || article.title} — ${SITE_NAME}`,
    description: article.seo?.metaDescription || article.excerpt || fallback.description,
    image,
    type: 'article',
  };
}

async function buildTeamMeta(apiUrl, slug, defaultImage, fallback) {
  if (!apiUrl) return fallback;
  const res = await fetch(`${apiUrl}/teams/${slug}`);
  if (!res.ok) return fallback;
  const { data: team } = await res.json();
  if (!team) return fallback;

  return {
    title: `${team.name} — ${SITE_NAME}`,
    description: `Latest ${team.name} news, fixtures, results and transfers.`,
    image: team.logo || defaultImage,
    type: 'website',
  };
}

async function buildMatchMeta(apiUrl, id, defaultImage, fallback) {
  if (!apiUrl) return fallback;
  const res = await fetch(`${apiUrl}/fixtures/${id}`);
  if (!res.ok) return fallback;
  const { data: fixture } = await res.json();
  if (!fixture) return fallback;

  const home = fixture.homeTeam?.name || 'Home';
  const away = fixture.awayTeam?.name || 'Away';
  const score =
    fixture.status?.short && fixture.status.short !== 'NS' && fixture.score
      ? ` (${fixture.score.home ?? '-'} - ${fixture.score.away ?? '-'})`
      : '';

  return {
    title: `${home} vs ${away}${score} — ${SITE_NAME}`,
    description: `Match result and stats: ${home} vs ${away}.`,
    image: fixture.homeTeam?.logo || fixture.awayTeam?.logo || defaultImage,
    type: 'website',
  };
}

async function buildCategoryMeta(apiUrl, slug, defaultImage, fallback) {
  let name = slug;
  if (apiUrl) {
    const res = await fetch(`${apiUrl}/categories`);
    if (res.ok) {
      const body = await res.json();
      const categories = body.data || body.categories || [];
      const match = Array.isArray(categories) ? categories.find((c) => c.slug === slug) : null;
      if (match) name = match.name;
    }
  }
  return {
    title: `${name} — ${SITE_NAME}`,
    description: `Latest ${name} news, updates and analysis from Tave Sports.`,
    image: defaultImage,
    type: 'website',
  };
}

function renderHtml(meta, fullUrl) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = escapeHtml(meta.image);
  const cardType = meta.image ? 'summary_large_image' : 'summary';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:type" content="${meta.type}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:secure_url" content="${image}" />
<meta property="og:url" content="${escapeHtml(fullUrl)}" />
<meta name="twitter:card" content="${cardType}" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const config = {
  path: '/*',
  excludedPath: [
    '/logos/*',
    '/favicon.png',
    '/robots.txt',
    '/ads.txt',
    '/_redirects',
    '/assets/*',
  ],
};
