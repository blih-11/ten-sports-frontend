import { useEffect, useRef } from 'react'

// Height, in pixels, of the fixed credit/share bar Getty renders beneath
// the photo inside its iframe. Getty's widget sizes the WHOLE iframe
// (photo + this bar) to one fixed pixel size baked into the embed code at
// copy time -- naively stretching that to 100% width also stretches the
// bar and leaves an ugly gap. We instead compute the photo-only ratio
// (excluding this bar), then rebuild the iframe's height from that ratio
// whenever the container is resized, so only the photo scales up.
const GETTY_CREDIT_BAR_HEIGHT = 70

// Third-party widget scripts (SmartFrame's loader, in particular) register
// a global Web Component via customElements.define() the first time they
// run. This page can easily have a dozen+ live embeds at once (article
// cards on the homepage, sidebar "latest" list, the article's own featured
// image), each rendering its own copy of this same <script src="..."> tag.
// If every EmbedHtml instance re-creates and re-executes that script tag on
// mount (as this component used to, unconditionally), the loader runs
// repeatedly and the 2nd+ run either throws re-registering the custom
// element or otherwise fails to pick up the newly-inserted markup --
// SmartFrame then falls back to its own "cannot be fully rendered" error
// box instead of the photo. SmartFrame's own docs are explicit that the
// loader must be included only once per page.
//
// Fix: track script `src`s we've already loaded (module-level, so it's
// shared across every EmbedHtml instance on the page) and only ever
// inject/execute a given src once. We still leave the actual embed markup
// (e.g. <smartframe-embed>) in the DOM every time -- once the custom
// element is registered, the browser auto-upgrades any matching element
// already present, so a second copy of the script isn't needed for it to
// render; only the *first* load needs to actually execute the script.
const loadedScriptSrcs = new Set()

function resolveSrc(src) {
  try {
    return new URL(src, document.baseURI).href
  } catch {
    return src
  }
}

export default function EmbedHtml({ html, className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !html) return

    container.innerHTML = html

    const scripts = Array.from(container.querySelectorAll('script'))
    scripts.forEach(oldScript => {
      const src = oldScript.getAttribute('src')

      if (src) {
        const resolved = resolveSrc(src)
        // NOTE: don't check document.querySelector here -- container.innerHTML
        // just above already inserted this exact <script> tag into the
        // document (inert, not yet executed). Querying the whole document
        // for that src would match that very tag and wrongly conclude it's
        // "already loaded" on every first-ever load too, deleting it before
        // it ever runs. The module-level Set only gets a src added to it
        // once we've actually created and inserted a real, executing
        // script for it (below), so it's the only reliable signal.
        if (loadedScriptSrcs.has(resolved)) {
          oldScript.remove()
          return
        }
        loadedScriptSrcs.add(resolved)
      }

      // First time we've seen this src (or it's an inline script, which
      // we always re-run since those are typically per-instance init
      // calls, not global registrations) -- clone it into a real script
      // element so the browser actually executes it.
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value))
      newScript.textContent = oldScript.textContent
      oldScript.parentNode.replaceChild(newScript, oldScript)
    })

    // Getty's widget script builds the actual <iframe> asynchronously, so
    // it isn't in the DOM the instant the script tag runs -- poll briefly
    // (via rAF) until it appears, then take over its sizing. Only bother
    // doing this for actual Getty embeds -- for anything else (SmartFrame,
    // etc.) no gettyimages.com iframe will ever show up, and polling for
    // one forever is just a silent, permanent rAF loop per embed.
    let cancelled = false
    let resizeHandler = null

    if (/gettyimages\.com/i.test(html)) {
      const trySize = () => {
        if (cancelled) return
        const iframe = container.querySelector('iframe[src*="gettyimages.com"]')
        if (!iframe) {
          requestAnimationFrame(trySize)
          return
        }
        const originalWidth = parseInt(iframe.getAttribute('width'), 10)
        const originalHeight = parseInt(iframe.getAttribute('height'), 10)
        if (!originalWidth || !originalHeight) return

        const photoRatio = (originalHeight - GETTY_CREDIT_BAR_HEIGHT) / originalWidth

        const resize = () => {
          const newWidth = container.clientWidth
          if (!newWidth) return
          iframe.style.width = newWidth + 'px'
          iframe.style.height = Math.round(newWidth * photoRatio + GETTY_CREDIT_BAR_HEIGHT) + 'px'
        }
        resize()
        resizeHandler = resize
        window.addEventListener('resize', resizeHandler)
      }
      trySize()
    }

    return () => {
      cancelled = true
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
    }
  }, [html])

  if (!html) return null
  return <div ref={containerRef} className={className} />
}