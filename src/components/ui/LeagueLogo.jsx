import { getCompetitionLogo } from '../../data/logos'

// Renders a competition/league badge from the local static logo library — never from the backend.
// Pass `slug` (preferred, e.g. league.slug) or `name`; `src` still works as a manual override.
export default function LeagueLogo({ slug, name, src, alt, className = 'w-4 h-4' }) {
  const resolved = src || getCompetitionLogo(slug || name)

  if (resolved) {
    return <img src={resolved} alt={alt || name || ''} className={`${className} object-contain shrink-0`} />
  }
  return (
    <div className={`${className} shrink-0 rounded-full bg-surface flex items-center justify-center`} title={name || ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-1/2 h-1/2 text-gray-600">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4M5 4h14l-1 5a6 6 0 01-12 0L5 4z" />
      </svg>
    </div>
  )
}
