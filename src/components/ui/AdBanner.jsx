export default function AdBanner({ size = 'leaderboard', hidden = false }) {
  if (hidden) return null

  const sizes = {
    leaderboard: 'h-24',
    rectangle: 'h-64',
    square: 'h-48',
  }

  return (
    <div className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center ${sizes[size]} text-gray-400 text-xs uppercase tracking-widest`}>
      Advertisement
    </div>
  )
}