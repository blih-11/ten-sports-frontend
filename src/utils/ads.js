// AdSense loader. No-ops if no client ID is set, so local/dev never loads
// real ad scripts. The client ID comes from the 'monetization' page-section
// (admin-editable) rather than a build-time env var, so it can change
// without a redeploy.

let scriptLoaded = false
let loadedClient = null

export function initAdsense(client) {
  if (!client || scriptLoaded) return
  scriptLoaded = true
  loadedClient = client

  const script = document.createElement('script')
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

// Call after an <ins class="adsbygoogle"> tag is mounted, to ask AdSense to
// fill it. Safe to call even before the script has finished loading.
export function requestAd() {
  try {
    window.adsbygoogle = window.adsbygoogle || []
    window.adsbygoogle.push({})
  } catch {
    // AdSense not loaded yet or blocked (ad blocker) -- fine to ignore
  }
}

export function isAdsenseReady() {
  return scriptLoaded
}

export function getLoadedClient() {
  return loadedClient
}
