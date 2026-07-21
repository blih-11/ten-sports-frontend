import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStoredConsent, updateConsent } from '../utils/consent'

// Shows once, on any page, until the visitor picks Accept or Decline.
// The actual Google Analytics / AdSense behavior change happens in
// consent.js (Google Consent Mode v2) -- this component is just the UI
// that triggers it and remembers the choice.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (getStoredConsent() === null) setVisible(true)
  }, [])

  const choose = (granted) => {
    updateConsent(granted)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[2147483647] bg-dark border-t-4 border-primary">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <p className="text-gray-400 text-xs sm:text-sm flex-1">
          We use cookies for analytics and to show relevant ads. See our{' '}
          <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link> to learn more.
        </p>
        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={() => choose(false)}
            className="flex-1 sm:flex-none border border-gray-600 text-gray-300 hover:text-white hover:border-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => choose(true)}
            className="flex-1 sm:flex-none bg-primary text-dark hover:brightness-95 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
