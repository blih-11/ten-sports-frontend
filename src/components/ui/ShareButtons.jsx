export default function ShareButtons({ title, url }) {
  const shareUrl = url || window.location.href
  const encoded = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title || document.title)

  const buttons = [
    {
      label: 'Twitter', bg: 'bg-[#1DA1F2]',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.9 2H22l-7.1 8.1L23 22h-6.6l-5.2-6.8L5 22H2l7.6-8.7L1.3 2H8l4.7 6.2L18.9 2zm-2.3 18h1.8L7.5 4H5.6l11 16z"/></svg>,
    },
    {
      label: 'Facebook', bg: 'bg-[#1877F2]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.94 8.44-9.94z"/></svg>,
    },
    {
      label: 'WhatsApp', bg: 'bg-[#25D366]',
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.9-.4-1.8-1-2.6-1.8-.7-.7-1.3-1.5-1.8-2.4-.1-.3-.1-.5.1-.6.2-.2.5-.5.6-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.6-1 2.6.1 1.1.6 2.2 1.3 3.2 1.4 2 3.2 3.5 5.3 4.5 1 .5 2 .8 3.1.9.7.1 1.4-.1 2-.5.6-.4 1-1.1 1.1-1.8 0-.2 0-.5-.1-.6-.1-.1-.5-.3-.8-.4z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.2L2 22l4.9-1.3C8.3 21.5 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.2-.4-4.6-1.3l-.3-.2-3.3.9.9-3.2-.2-.3C3.6 14.4 3.2 12.7 3.2 11 3.2 6.5 6.5 3.2 11 3.2c4.5 0 8.8 4.3 8.8 8.8 0 4.5-3.3 8.2-7.8 8.2z"/></svg>,
    },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied!')
  }

  return (
    <div className="flex items-center gap-2">
      {buttons.map(btn => (
        <a key={btn.label} href={btn.href} target="_blank" rel="noopener noreferrer"
          aria-label={`Share on ${btn.label}`}
          className={`w-9 h-9 rounded-full ${btn.bg} flex items-center justify-center text-white hover:opacity-80 transition-opacity`}>
          {btn.icon}
        </a>
      ))}
      <button onClick={handleCopy} aria-label="Copy link"
        className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757M10.81 15.313a4.5 4.5 0 01-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
        </svg>
      </button>
    </div>
  )
}