import { getTeamLogo } from '../../data/logos'

// Renders a team badge from the local static logo library — never from the backend.
// Pass `name` (team display name / API name) and it resolves automatically.
// `src` can still be passed to force a specific path (e.g. a manual override).
export default function TeamLogo({ name, src, alt, className = 'w-5 h-5' }) {
  const resolved = src || getTeamLogo(name)

  if (resolved) {
    return <img src={resolved} alt={alt || name || ''} className={`${className} object-contain shrink-0`} />
  }
  return (
    <div className={`${className} shrink-0 rounded-full bg-surface flex items-center justify-center`} title={name || ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-1/2 h-1/2 text-gray-600">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />
      </svg>
    </div>
  )
}
