import { useEffect, useRef } from 'react'

// Height, in pixels, of the fixed credit/share bar Getty renders beneath
// the photo inside its iframe. Getty's widget sizes the WHOLE iframe
// (photo + this bar) to one fixed pixel size baked into the embed code at
// copy time -- naively stretching that to 100% width also stretches the
// bar and leaves an ugly gap. We instead compute the photo-only ratio
// (excluding this bar), then rebuild the iframe's height from that ratio
// whenever the container is resized, so only the photo scales up.
const GETTY_CREDIT_BAR_HEIGHT = 70

export default function EmbedHtml({ html, className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !html) return

    container.innerHTML = html

    const scripts = Array.from(container.querySelectorAll('script'))
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value))
      newScript.textContent = oldScript.textContent
      oldScript.parentNode.replaceChild(newScript, oldScript)
    })

    // Getty's widget script builds the actual <iframe> asynchronously, so
    // it isn't in the DOM the instant the script tag runs -- poll briefly
    // (via rAF) until it appears, then take over its sizing.
    let cancelled = false
    let resizeHandler = null

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

    return () => {
      cancelled = true
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
    }
  }, [html])

  if (!html) return null
  return <div ref={containerRef} className={className} />
}
