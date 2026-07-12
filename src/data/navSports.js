// Fallback sports list, used until the live nav structure loads from the API
// (or if that fetch ever fails). Shared by Navbar and Footer so both always
// show the same set of sports instead of two hand-maintained lists that can
// drift apart.
export const FALLBACK_SPORTS = [
  { label: 'Football',   slug: 'football' },
  { label: 'Tennis',     slug: 'tennis' },
  { label: 'Formula 1',  slug: 'formula-1' },
  { label: 'NFL',        slug: 'nfl' },
  { label: 'NBA',        slug: 'nba' },
  { label: 'Rugby',      slug: 'rugby' },
  { label: 'Golf',       slug: 'golf' },
  { label: 'Boxing',     slug: 'boxing' },
]
