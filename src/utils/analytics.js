// Minimal Google Analytics 4 wiring. No-ops entirely if
// VITE_GA_MEASUREMENT_ID isn't set, so local dev never sends real data to
// GA and never even loads the script.
//
// GA's default "enhanced measurement" auto-tracks the very first page
// load, but has no idea when React Router changes the URL client-side —
// so we disable that automatic hit (send_page_view: false) and fire our
// own page_view event on every route change instead, including the first
// one. That's the only way to get accurate per-page numbers in an SPA.
import { applyStoredConsentDefault } from './consent'

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

let initialized = false

export function initGA() {
  if (!GA_ID || initialized) return
  initialized = true

  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  window.gtag = gtag

  // Consent Mode v2: must be pushed before 'config', so GA (and AdSense,
  // which reads the same signal) treat this visitor as denied by default
  // until the cookie banner says otherwise. Safe to call before the
  // gtag.js script below has even loaded -- dataLayer just queues
  // commands until the script processes them.
  applyStoredConsentDefault()

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  gtag('js', new Date())
  gtag('config', GA_ID, { send_page_view: false })
}

export function trackPageview(path) {
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}