// Cookie-consent storage + Google Consent Mode v2 signal helpers.
//
// This is the piece that actually matters to Google/GDPR, separate from
// the visible banner UI in CookieConsent.jsx: Consent Mode is a signal
// Google's own scripts (gtag.js for Analytics, adsbygoogle.js for AdSense)
// read to decide whether to set cookies / personalize at all. We're not
// blocking the scripts from loading -- we're telling Google up front
// "assume denied until told otherwise", which is what Google's own
// consent-mode setup wizard is asking for when it asks "which kind of
// consent banner do you have".
const STORAGE_KEY = 'tave_cookie_consent' // 'granted' | 'denied' | null (undecided)

export function getStoredConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function setStoredConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // localStorage unavailable (private browsing, etc) -- consent just
    // won't persist across reloads, not worth failing over.
  }
}

function pushConsent(command, granted) {
  if (typeof window.gtag !== 'function') return
  const state = granted ? 'granted' : 'denied'
  window.gtag('consent', command, {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  })
}

// Called once, as early as possible (see initGA in analytics.js) -- before
// gtag('config', ...) -- so Google Analytics and AdSense both start out
// assuming "denied" unless a prior visit already recorded a real choice.
export function applyStoredConsentDefault() {
  const stored = getStoredConsent()
  pushConsent('default', stored === 'granted')
}

// Called when the visitor clicks Accept/Decline on the banner.
export function updateConsent(granted) {
  setStoredConsent(granted ? 'granted' : 'denied')
  pushConsent('update', granted)
}
