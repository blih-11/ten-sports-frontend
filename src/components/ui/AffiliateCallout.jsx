import { useMonetization } from '../../context/MonetizationContext'

// A text/link-style sponsored callout (distinct from AdBanner's image
// banner), meant for spots like the match page where "Odds via X" reads
// more naturally than a display ad. Renders nothing if the slot is empty,
// so it's always safe to drop in.
export default function AffiliateCallout({ slotKey, className = '' }) {
  const { slots, responsibleGamblingNote } = useMonetization()
  const slot = slots?.[slotKey]

  if (!slot || slot.type !== 'affiliate' || !slot.linkUrl) return null

  return (
    <div className={`bg-darker border border-gray-800 rounded-xl px-5 py-4 ${className}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <span className="text-gray-500 text-[10px] uppercase tracking-widest">Sponsored</span>
        <a
          href={slot.linkUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="text-primary font-bold text-sm hover:underline"
        >
          {slot.label || 'View odds for this match'}
        </a>
      </div>
      {responsibleGamblingNote && (
        <p className="text-gray-600 text-[10px] mt-2 leading-relaxed">{responsibleGamblingNote}</p>
      )}
    </div>
  )
}
