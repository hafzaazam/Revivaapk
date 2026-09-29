import { useEffect } from 'react'
import {
  SITE_DOMAIN,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  DEFAULT_LOCALE,
  ORGANIZATION_SCHEMA,
  BRAND_SCHEMA,
  WEBSITE_SCHEMA,
} from '../lib/seoConfig'

function setMetaTag(name, content, attr = 'name') {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  if (!href) return
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function injectSchema(schemaId, data) {
  if (!data) return
  let script = document.getElementById(schemaId)
  if (!script) {
    script = document.createElement('script')
    script.id = schemaId
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

function removeSchema(schemaId) {
  const script = document.getElementById(schemaId)
  if (script) script.remove()
}

/**
 * Reusable SEO Component for Revivaa
 */
export default function SEO({
  title,
  description,
  canonical,
  keywords,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  structuredData = null,
  schemaId = 'page-schema',
}) {
  useEffect(() => {
    // 1. Page Title
    if (title) {
      document.title = title
    }

    // 2. Meta Tags
    if (description) {
      setMetaTag('description', description)
    }

    if (keywords) {
      setMetaTag('keywords', keywords)
    }

    // 3. Robots Directives
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow')
    } else {
      setMetaTag(
        'robots',
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      )
    }

    // 4. Canonical URL
    const canonicalUrl = canonical || `${SITE_DOMAIN}${window.location.pathname}`
    setCanonical(canonicalUrl)

    // 5. Open Graph Meta Tags
    setMetaTag('og:site_name', SITE_NAME, 'property')
    setMetaTag('og:title', title || SITE_NAME, 'property')
    setMetaTag('og:description', description || '', 'property')
    setMetaTag('og:url', canonicalUrl, 'property')
    setMetaTag('og:type', ogType, 'property')
    setMetaTag('og:locale', DEFAULT_LOCALE, 'property')
    setMetaTag('og:image', ogImage, 'property')
    setMetaTag('og:image:alt', title || 'Revivaa Botanical Hair Care', 'property')

    // 6. Twitter / X Card Meta Tags
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', title || SITE_NAME)
    setMetaTag('twitter:description', description || '')
    setMetaTag('twitter:image', ogImage)
    setMetaTag('twitter:image:alt', title || 'Revivaa Botanical Hair Care')

    // 7. Core Site Schemas (Organization, Brand & WebSite)
    injectSchema('site-org-schema', ORGANIZATION_SCHEMA)
    injectSchema('site-brand-schema', BRAND_SCHEMA)
    injectSchema('site-web-schema', WEBSITE_SCHEMA)

    // 8. Custom Page Structured Data (e.g. Product, BreadcrumbList, FAQPage, Article)
    if (structuredData) {
      injectSchema(schemaId, structuredData)
    }

    return () => {
      if (structuredData) {
        removeSchema(schemaId)
      }
    }
  }, [title, description, canonical, keywords, ogType, ogImage, noindex, structuredData, schemaId])

  return null
}
