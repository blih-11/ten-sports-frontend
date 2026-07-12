import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getPageSections } from '../utils/api'
import { canonicalUrl } from '../utils/seo'

const DEFAULTS = {
  hero_heading: 'About Ten Sports',
  hero_subheading: 'Your number one source for sports news, analysis and opinion.',
  who_we_are_heading: 'Who We Are',
  who_we_are_body: 'Ten Sports is a digital sports media platform dedicated to delivering fast, accurate and engaging sports content across football, NBA, tennis and more.\n\nFounded by passionate sports fans, we believe everyone deserves access to quality sports journalism — from breaking transfer news to in-depth tactical analysis.',
  what_we_cover_heading: 'What We Cover',
  what_we_cover_items: 'Football — Premier League, UCL, La Liga & more\nNBA — EuroLeague & more\nTennis — ATP, WTA, Grand Slams\nTransfers — Breaking news & rumours\nAnalysis — Tactical breakdowns & opinion',
  stats: [{ number: '4.2K+', label: 'Followers' }, { number: '1M+', label: 'Monthly Views' }, { number: '1.8K+', label: 'Articles' }, { number: '10+', label: 'Sports Covered' }],
  cta_heading: 'Join Our Team',
  cta_body: "Are you a passionate sports writer or journalist? We'd love to hear from you.",
  seo_meta_title: 'About Us — Ten Sports',
  seo_meta_description: '',
}

export default function About() {
  const [page, setPage] = useState(DEFAULTS)

  useEffect(() => {
    getPageSections('about')
      .then(res => setPage(p => ({ ...p, ...(res.data?.data || {}) })))
      .catch(() => {}) // keep defaults if this fails
  }, [])

  // "About Ten Sports" -> "About" (plain) + "Ten Sports" (accent colour),
  // matching the original two-tone heading style for whatever text an
  // editor sets.
  const headingWords = (page.hero_heading || '').split(' ')
  const [firstWord, ...restWords] = headingWords

  const bodyParagraphs = (page.who_we_are_body || '').split('\n\n').filter(Boolean)
  const coverItems = (page.what_we_cover_items || '').split('\n').filter(Boolean)

  return (
    <>
      <Helmet>
        <title>{page.seo_meta_title || DEFAULTS.seo_meta_title}</title>
        {page.seo_meta_description && <meta name="description" content={page.seo_meta_description} />}
        <link rel="canonical" href={canonicalUrl('/about')} />
      </Helmet>
      <div className="bg-dark py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-white font-black text-5xl mb-4">
            {firstWord}{restWords.length > 0 && <> <span className="text-primary">{restWords.join(' ')}</span></>}
          </h1>
          <p className="text-gray-400 text-lg">{page.hero_subheading}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-dark font-black text-2xl mb-4">{page.who_we_are_heading}</h2>
            {bodyParagraphs.map((para, i) => (
              <p key={i} className={`text-gray-600 leading-relaxed ${i < bodyParagraphs.length - 1 ? 'mb-4' : ''}`}>{para}</p>
            ))}
          </div>
          <div>
            <h2 className="text-dark font-black text-2xl mb-4">{page.what_we_cover_heading}</h2>
            <ul className="space-y-3">
              {coverItems.map(item => (
                <li key={item} className="flex items-start gap-3 text-gray-600 text-sm">
                  <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-dark font-black text-2xl mb-3">{page.cta_heading}</h2>
          <p className="text-gray-500 mb-6">{page.cta_body}</p>
          <a href="/contact" className="bg-dark text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-dark transition-all inline-block">Get in Touch</a>
        </div>
      </div>
    </>
  )
}
