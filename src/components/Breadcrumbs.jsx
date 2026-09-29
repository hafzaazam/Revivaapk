import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { SITE_DOMAIN } from '../lib/seoConfig'
import './Breadcrumbs.css'

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label
 * @property {string} [href]
 */

/**
 * Breadcrumbs navigation component with BreadcrumbList JSON-LD
 * @param {{ items: BreadcrumbItem[] }} props
 */
export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null

  const allItems = [{ label: 'Home', href: '/' }, ...items]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${SITE_DOMAIN}${item.href}` : `${SITE_DOMAIN}${window.location.pathname}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="breadcrumbs container">
        <ol className="breadcrumbs__list">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1
            return (
              <li key={item.label} className="breadcrumbs__item">
                {index === 0 ? (
                  <Link to="/" className="breadcrumbs__link breadcrumbs__home" aria-label="Home">
                    <Home size={13} strokeWidth={1.8} />
                    <span className="breadcrumbs__text">{item.label}</span>
                  </Link>
                ) : isLast || !item.href ? (
                  <span className="breadcrumbs__current" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.href} className="breadcrumbs__link">
                    {item.label}
                  </Link>
                )}
                {!isLast && (
                  <span className="breadcrumbs__sep" aria-hidden="true">
                    <ChevronRight size={12} strokeWidth={1.8} />
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
