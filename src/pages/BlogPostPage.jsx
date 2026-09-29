import { useParams, Link, Navigate } from 'react-router-dom'
import { Clock, User, ArrowRight, Calendar } from 'lucide-react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { BLOG_POSTS } from '../data/blogPosts'
import { SITE_DOMAIN, SITE_NAME } from '../lib/seoConfig'
import './BlogPostPage.css'

export default function BlogPostPage() {
  const { slug } = useParams()
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  const canonicalUrl = `${SITE_DOMAIN}/blog/${post.slug}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_DOMAIN}/assets/logo-r.png`,
      },
    },
  }

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug)

  return (
    <div className="app">
      <SEO
        title={post.seoTitle || `${post.title} | Revivaa`}
        description={post.seoDescription || post.excerpt}
        canonical={canonicalUrl}
        keywords={`${post.category}, hair oil guide, scalp care routine, Revivaa botanical hair care`}
        ogType="article"
        ogImage={post.coverImage}
        structuredData={articleSchema}
        schemaId={`article-${post.slug}-schema`}
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" className="article-page" tabIndex={-1}>
        <Breadcrumbs
          items={[
            { label: 'Journal', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ]}
        />

        <article className="article-page__main container">
          {/* Header */}
          <header className="article-page__header">
            <div className="article-page__category-pill">{post.category}</div>
            <h1 className="article-page__title">{post.h1 || post.title}</h1>

            <div className="article-page__meta">
              <div className="article-page__author">
                <span className="article-page__avatar clay-icon" aria-hidden="true">
                  <User size={16} />
                </span>
                <div>
                  <strong>{post.author.name}</strong>
                  <span>{post.author.role}</span>
                </div>
              </div>

              <div className="article-page__meta-stats">
                <span>
                  <Calendar size={13} />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>·</span>
                <span>
                  <Clock size={13} />
                  {post.readingTime}
                </span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="article-page__featured-img-wrap">
            <img
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              className="article-page__featured-img"
              width={1100}
              height={580}
              fetchPriority="high"
            />
          </div>

          {/* Content Body */}
          <div className="article-page__body">
            <p className="article-page__lead-para">{post.excerpt}</p>

            {post.sections.map((sec, idx) => (
              <section key={idx} className="article-page__section">
                <h2>{sec.heading}</h2>
                <p>{sec.body}</p>
              </section>
            ))}

            {/* Contextual Internal Links Box */}
            {post.internalLinks && post.internalLinks.length > 0 && (
              <div className="article-page__internal-box clay-cream">
                <h3>Recommended Botanical Hair Care Destinations</h3>
                <ul>
                  {post.internalLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link to={link.to}>
                        <span>{link.label}</span>
                        <ArrowRight size={14} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>

        {/* Related Articles */}
        {otherPosts.length > 0 && (
          <section className="article-page__related container">
            <h2 className="article-page__related-title">More Botanical Wisdom from the Journal</h2>
            <div className="article-page__related-grid">
              {otherPosts.map((rel) => (
                <article key={rel.slug} className="article-page__related-card clay">
                  <Link to={`/blog/${rel.slug}`} className="article-page__related-thumb">
                    <img src={rel.coverImage} alt={rel.title} width={360} height={220} loading="lazy" />
                  </Link>
                  <div className="article-page__related-body">
                    <span className="article-page__related-cat">{rel.category}</span>
                    <h3>
                      <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
