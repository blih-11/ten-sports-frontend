import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { getPageSections } from '../utils/api'
import { canonicalUrl } from '../utils/seo'

const DEFAULTS = {
  hero_heading: 'Contact Us',
  hero_subheading: 'Got a story tip, advertising enquiry or just want to say hi?',
  contact_email: 'hello@tavesports.com',
  contact_twitter: '@TaveSports',
  contact_facebook: 'Tave Sports',
  contact_location: 'Lagos, Nigeria',
  seo_meta_title: 'Contact Us — Tave Sports',
  seo_meta_description: '',
}

// Icons are fixed UI chrome, not editorial content -- only the label/value
// text next to each one comes from the CMS.
const ICON_PATHS = {
  Email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  Twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
  Facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  Location: 'M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z',
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(DEFAULTS)

  useEffect(() => {
    getPageSections('contact')
      .then(res => setPage(p => ({ ...p, ...(res.data?.data || {}) })))
      .catch(() => {})
  }, [])

  const contactItems = [
    { label: 'Email', value: page.contact_email },
    { label: 'Twitter', value: page.contact_twitter },
    { label: 'Facebook', value: page.contact_facebook },
    { label: 'Location', value: page.contact_location },
  ]

  // NOTE: this still fakes the send (setTimeout) rather than hitting a real
  // endpoint -- there's no contact-form-submission API yet. Flagging this
  // rather than silently leaving it looking done: messages typed here
  // currently go nowhere.
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.')
      setForm({ name: '', email: '', subject: '', message: '' })
      setLoading(false)
    }, 1000)
  }

  const [firstWord, ...restWords] = (page.hero_heading || '').split(' ')

  return (
    <>
      <Helmet>
        <title>{page.seo_meta_title || DEFAULTS.seo_meta_title}</title>
        {page.seo_meta_description && <meta name="description" content={page.seo_meta_description} />}
        <link rel="canonical" href={canonicalUrl('/contact')} />
      </Helmet>
      <div className="bg-dark py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-white font-black text-5xl mb-4">
            {firstWord}{restWords.length > 0 && <> <span className="text-primary">{restWords.join(' ')}</span></>}
          </h1>
          <p className="text-gray-400 text-lg">{page.hero_subheading}</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            {contactItems.map(item => (
              <div key={item.label} className="flex gap-4">
                <div className="w-10 h-10 bg-dark rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON_PATHS[item.label]} />
                  </svg>
                </div>
                <div>
                  <div className="text-dark font-semibold text-sm">{item.label}</div>
                  <div className="text-gray-500 text-sm">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[{ key: 'name', label: 'Your Name', type: 'text', placeholder: 'John Doe' }, { key: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com' }].map(f => (
                <div key={f.key}>
                  <label className="text-dark text-xs font-bold uppercase tracking-widest block mb-2">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-dark text-xs font-bold uppercase tracking-widest block mb-2">Subject</label>
              <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="What's this about?" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-dark text-xs font-bold uppercase tracking-widest block mb-2">Message</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Your message..." rows={6} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none" />
            </div>
            <button type="submit" disabled={loading} className="bg-dark text-primary px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-dark transition-all disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
