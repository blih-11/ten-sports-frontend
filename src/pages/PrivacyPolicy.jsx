import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getPageSections } from '../utils/api'
import { canonicalUrl } from '../utils/seo'

// Default text below is the fallback shown until/unless it's edited from
// the admin (Pages -> Privacy Policy). It's a starting draft reflecting
// what this site actually does (Google Analytics, Google AdSense,
// newsletter emails) -- NOT a substitute for review by a lawyer before
// relying on it, especially for the liability/jurisdiction sections.
const DEFAULT_CONTENT = `Last updated: [DATE]

Tave Sports ("Tave Sports", "we", "us", or "our") operates this website (the "Site"). This Privacy Policy explains what information we collect, how we use it, and the choices you have.

## Information We Collect

We collect a very small amount of personal information:

Information you give us directly: if you sign up for our newsletter, we collect the email address you provide. If you contact us through the Contact page, we collect your name, email address and message.

Information collected automatically: like most websites, we use Google Analytics to understand how visitors use the Site. This collects standard usage data such as pages viewed, time on page, approximate location (derived from IP address), device and browser type, and referring website. We do not control what Google Analytics collects beyond its standard settings.

## Cookies and Advertising

This Site displays advertising through Google AdSense, and in some places affiliate links to third-party betting/gambling operators. Google and its partners may use cookies and similar technologies to serve ads based on your prior visits to this or other websites. You can review and adjust how Google personalizes ads for you at Google's Ads Settings (adssettings.google.com), and you can read Google's own policy on this at policies.google.com/technologies/ads.

Google Analytics also sets its own cookies to distinguish visitors and sessions.

Most browsers let you block or delete cookies through their settings. Blocking cookies may affect how parts of the Site work.

## How We Use Information

We use the information above to: operate and improve the Site; send the newsletter to people who sign up for it; understand traffic and readership through analytics; and respond to messages sent through the Contact page.

We do not sell your personal information.

## Third-Party Services

We use a small number of third-party services to run this Site: Google Analytics (site analytics), Google AdSense (advertising), and a cloud image-hosting provider for photos used on the Site. Each of these providers processes data under their own privacy policies.

## Your Choices

You can unsubscribe from the newsletter at any time using the link in any newsletter email, or by contacting us directly. You can ask us to delete an email address from our newsletter list by contacting us at the address below. You can control cookies through your browser settings, and control Google's ad personalization through Google's Ads Settings linked above.

## Children's Privacy

This Site is not directed at children, and we do not knowingly collect personal information from children.

## Data Security

We take reasonable steps to protect the information we hold, but no method of storage or transmission over the internet is completely secure.

## International Visitors

This Site is accessible globally. Depending on where you're located, the third-party services above (Google and our image host) may process your information on servers outside your country, including outside Nigeria.

## Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date.

## Contact Us

Questions about this policy can be sent through our Contact page.`

function renderContent(text) {
  return text.split(/\n\s*\n/).map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('## ')) {
      return <h2 key={i} className="text-dark font-black text-xl mt-10 mb-3">{trimmed.slice(3)}</h2>
    }
    return <p key={i} className="text-gray-600 text-sm leading-relaxed mb-4">{trimmed}</p>
  })
}

export default function PrivacyPolicy() {
  const [content, setContent] = useState(DEFAULT_CONTENT)

  // Fully editable from the admin (Pages -> Privacy Policy) as a single
  // long-form text field. Falls back to the default draft above if the
  // API is unreachable or nothing has been saved yet.
  useEffect(() => {
    getPageSections('privacy')
      .then(res => {
        const data = res.data?.data
        if (data?.content) setContent(data.content)
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <Helmet>
        <title>Privacy Policy — Tave Sports</title>
        <link rel="canonical" href={canonicalUrl('/privacy')} />
      </Helmet>
      <div className="bg-dark py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-white font-black text-4xl sm:text-5xl mb-4">Privacy Policy</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16">
        {renderContent(content)}
      </div>
    </>
  )
}
