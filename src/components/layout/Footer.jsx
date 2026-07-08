import { useState } from 'react'
import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'Sports',
    links: [
      { to: '/football', label: 'Football' },
      { to: '/nba', label: 'NBA' },
      { to: '/tennis', label: 'Tennis' },
      { to: '/athletics', label: 'Athletics' },
    ],
  },
  {
    title: 'Content',
    links: [
      { to: '/transfers', label: 'Transfers' },
      { to: '/previews', label: 'Previews' },
      { to: '/analysis', label: 'Analysis' },
      { to: '/opinion', label: 'Opinion' },
    ],
  },
  {
    title: 'Ten Sports Channels',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact' },
      { to: '/advertise', label: 'Advertise' },
      { to: '/careers', label: 'Careers' },
    ],
  },
]

const legalLinks = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Use' },
  { to: '/cookies', label: 'Cookie Settings' },
]

const socials = [
  {
    label: 'WhatsApp',
    href: 'https://wa.me/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.9-.4-1.8-1-2.6-1.8-.7-.7-1.3-1.5-1.8-2.4-.1-.3-.1-.5.1-.6.2-.2.5-.5.6-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.6-1 2.6.1 1.1.6 2.2 1.3 3.2 1.4 2 3.2 3.5 5.3 4.5 1 .5 2 .8 3.1.9.7.1 1.4-.1 2-.5.6-.4 1-1.1 1.1-1.8 0-.2 0-.5-.1-.6-.1-.1-.5-.3-.8-.4z"/>
        <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.2L2 22l4.9-1.3C8.3 21.5 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.2-.4-4.6-1.3l-.3-.2-3.3.9.9-3.2-.2-.3C3.6 14.4 3.2 12.7 3.2 11 3.2 6.5 6.5 3.2 11 3.2c4.5 0 8.8 4.3 8.8 8.8 0 4.5-3.3 8.2-7.8 8.2z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.94 8.44-9.94z"/>
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.9 2H22l-7.1 8.1L23 22h-6.6l-5.2-6.8L5 22H2l7.6-8.7L1.3 2H8l4.7 6.2L18.9 2zm-2.3 18h1.8L7.5 4H5.6l11 16z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2c2.7 0 3.06.01 4.12.06 1.06.05 1.78.22 2.41.46.66.26 1.21.6 1.76 1.15.5.5.85 1.06 1.12 1.7.24.62.41 1.34.46 2.41.05 1.06.06 1.42.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.78-.46 2.41-.26.66-.6 1.21-1.15 1.76-.5.5-1.06.85-1.7 1.12-.62.24-1.34.41-2.41.46-1.06.05-1.42.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.78-.22-2.41-.46-.66-.26-1.21-.6-1.76-1.15-.5-.5-.85-1.06-1.12-1.7-.24-.62-.41-1.34-.46-2.41C2.01 15.06 2 14.7 2 12s.01-3.06.06-4.12c.05-1.06.22-1.78.46-2.41.26-.66.6-1.21 1.15-1.76.5-.5 1.06-.85 1.7-1.12.62-.24 1.34-.41 2.41-.46C8.94 2.01 9.3 2 12 2zm0 1.8c-2.66 0-2.98.01-4.03.06-.86.04-1.33.18-1.64.3-.41.16-.7.35-1.01.66-.31.31-.5.6-.66 1.01-.12.31-.26.78-.3 1.64C4.31 9.02 4.3 9.34 4.3 12s.01 2.98.06 4.03c.04.86.18 1.33.3 1.64.16.41.35.7.66 1.01.31.31.6.5 1.01.66.31.12.78.26 1.64.3 1.05.05 1.37.06 4.03.06s2.98-.01 4.03-.06c.86-.04 1.33-.18 1.64-.3.41-.16.7-.35 1.01-.66.31-.31.5-.6.66-1.01.12-.31.26-.78.3-1.64.05-1.05.06-1.37.06-4.03s-.01-2.98-.06-4.03c-.04-.86-.18-1.33-.3-1.64-.16-.41-.35-.7-.66-1.01-.31-.31-.6-.5-1.01-.66-.31-.12-.78-.26-1.64-.3C14.98 3.81 14.66 3.8 12 3.8zm0 3.5a4.7 4.7 0 110 9.4 4.7 4.7 0 010-9.4zm0 7.75a3.05 3.05 0 100-6.1 3.05 3.05 0 000 6.1zm5.98-7.93a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M16.6 5.8c-.9-.6-1.5-1.6-1.6-2.8h-2.9v13.3c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .5 0 .8.1v-3c-.3 0-.5-.1-.8-.1-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4V9.5c1.1.8 2.5 1.3 4 1.3V7.9c-.9 0-1.7-.3-2.4-.8-.2-.1-.4-.3-.6-.5-.2-.2-.3-.3-.4-.4z"/>
      </svg>
    ),
  },
]

function FooterSection({ title, links }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {/* Mobile accordion */}
      <button
        onClick={() => setOpen(o => !o)}
        className="md:hidden w-full flex items-center justify-between py-4 border-b border-gray-800 text-left"
      >
        <span className="text-white text-sm font-semibold">{title}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="md:hidden pb-4 space-y-2 pl-1">
          {links.map(link => (
            <li key={link.to}><Link to={link.to} className="text-gray-500 text-sm hover:text-primary transition-colors">{link.label}</Link></li>
          ))}
        </ul>
      )}

      {/* Desktop static column */}
      <div className="hidden md:block">
        <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">{title}</h4>
        <ul className="space-y-2">
          {links.map(link => (
            <li key={link.to}><Link to={link.to} className="text-gray-500 text-sm hover:text-primary transition-colors">{link.label}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-darker border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="text-white font-black text-xl mb-3">TEN <span className="text-primary">SPORTS</span></div>
          <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-md">Your number one source for football, NBA, tennis, and all things sports.</p>
          <div className="flex gap-3">
            {socials.map(s => (
              
            <a    key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-11 h-11 bg-surface rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary hover:text-dark transition-all"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-8 mb-10">
          {sections.map(section => (
            <FooterSection key={section.title} title={section.title} links={section.links} />
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Ten Sports. All rights reserved.</p>
          <div className="flex gap-4">
            {legalLinks.map(l => (
              <Link key={l.to} to={l.to} className="text-gray-600 text-xs hover:text-gray-400 transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}