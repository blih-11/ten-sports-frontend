import { useEffect, useRef } from 'react'
import { useMonetization } from '../../context/MonetizationContext'
import { requestAd } from '../../utils/ads'

const SIZE_CLASSES = {
  leaderboard: 'h-24',
  rectangle: 'h-64',
  square: 'h-48',
}

// AdBanner is content-driven: it looks up `slotKey` in the admin-managed
// 'monetization' page sections and renders whatever that slot is currently
// configured as -- a real AdSense unit, an affiliate banner, or nothing.
// Falls back to the old dashed placeholder in dev/when nothing is configured
// yet, so pages never look broken while ads are being set up.
export default function AdBanner({ size = 'leaderboard', hidden = false, slotKey = null }) {
  const { loading, adsEnabled, slots } = useMonetization()
  const insRef = useRef(null)
  const slot = slotKey ? slots?.[slotKey] : null

  const isAdsense = adsEnabled && slot?.type === 'adsense' && slot?.slotId
  const isAffiliate = slot?.type === 'affiliate' && slot?.imageUrl && slot?.linkUrl

  useEffect(() => {
    if (isAdsense && insRef.current) requestAd()
  }, [isAdsense, slot?.slotId])

  if (hidden) return null
  if (loading) return <div className={`bg-gray-50 rounded-lg ${SIZE_CLASSES[size]}`} />

  if (isAdsense) {
    return (
      <div className={`w-full overflow-hidden flex items-center justify-center ${SIZE_CLASSES[size]}`}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client={slots.adsense_client_id}
          data-ad-slot={slot.slotId}
          data-ad-format={slot.format || 'auto'}
          data-full-width-responsive="true"
        />
      </div>
    )
  }

  if (isAffiliate) {
    return (
      <a
        href={slot.linkUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={`block w-full rounded-lg overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity ${SIZE_CLASSES[size]}`}
      >
        <img src={slot.imageUrl} alt={slot.altText || slot.label || 'Sponsored'} className="w-full h-full object-cover" />
      </a>
    )
  }

  // Not configured yet -- keep the visible placeholder so the layout still
  // makes sense to an editor browsing the site before slots are filled in.
  return (
    <div className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center ${SIZE_CLASSES[size]} text-gray-400 text-xs uppercase tracking-widest`}>
      Advertisement
    </div>
  )
}
